use {
    byteorder::{BigEndian, LittleEndian, ReadBytesExt, WriteBytesExt},

    zerocopy::{
        byteorder::U64, AsBytes, FromBytes, LayoutVerified, Unaligned, U16, U32,
    },
};
use std::time::{SystemTime, UNIX_EPOCH};

use async_std::sync::{Arc, Mutex};

struct Cache(sled::IVec);

impl Cache {
    fn new(expired_at: u64, mut value: Vec<u8>) -> Cache {
        let mut wtr = Vec::new();
        wtr.write_u64::<LittleEndian>(expired_at).unwrap();
        value.extend_from_slice(&wtr);
        Cache(sled::IVec::from(value))
    }
    fn expired_at(&self) -> u64 {
        (&self.0[self.0.len()-8..self.0.len()]).read_u64::<LittleEndian>().expect("8 bytes guaranteed")
    }
    fn is_expired(&self, now: u64) -> bool {
        self.expired_at() < now
    }
    pub fn value(&self) -> &[u8] {
        &self.0[0..self.0.len()-8]
    }
}

#[derive(Clone)]
pub struct CacheDb {
    lock: Arc<Mutex<usize>>,
    db: sled::Db,
}
impl CacheDb {
    pub fn new() -> Self {
        let db = sled::Config::new()
            .temporary(true)
            .open()
            .unwrap();
        let lock = Arc::new(Mutex::new(0));
        CacheDb{ lock, db }
    }
}

pub async fn load_or_update<F>(db: &CacheDb, key: &[u8], duration_secs: u64, f: impl FnOnce() -> F) -> Result<Vec<u8>, super::error::Error> 
where F: std::future::Future<Output = Result<Vec<u8>, super::error::Error>> {
    let now: u64 = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    if let Some(bytes) = db.db.get(key)? {
        let cache = Cache(bytes);
        if(cache.is_expired(now)) {
            let _ = db.lock.lock().await;
            if let Some(bytes) = db.db.get(key)? {
                let cache = Cache(bytes);
                if(cache.is_expired(now)) {
                    let new_cache = Cache::new(now + duration_secs, f().await?);
                    db.db.insert(key, new_cache.0)?;
                } else {
                    return Ok(cache.value().to_vec());
                }
            }
        } else {
            return Ok(cache.value().to_vec());
        }
    } else {
        let _ = db.lock.lock().await;
        if let None = db.db.get(key)? {
            let new_cache = Cache::new(now + duration_secs, f().await?);
            db.db.insert(key, new_cache.0)?;
        }
    }
    if let Some(bytes) = db.db.get(key)? {
        let cache = Cache(bytes);
        return Ok(cache.value().to_vec());
    } else {
        return Err(super::error::Error::Wierd);
    }
}
/*
pub async fn load_or_update<'a, F>(db: &'a sled::Db, key: &[u8], duration_secs: u64, f: impl FnOnce() -> F) -> Result<Vec<u8>, super::error::Error> 
where F: std::future::Future<Output = Result<Vec<u8>, super::error::Error>> {
    let now: u64 = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    if let Some(bytes) = db.get(key)? {
        let cache = Cache(bytes);
        if(cache.is_expired(now)) {
            let new_cache = Cache::new(now + duration_secs, f().await?);
            db.insert(key, new_cache.0)?;
        } else {
            return Ok(cache.value().to_vec());
        }
    } else {
        let new_cache = Cache::new(now + duration_secs, f().await?);
        db.insert(key, new_cache.0)?;
    }
    if let Some(bytes) = db.get(key)? {
        let cache = Cache(bytes);
        return Ok(cache.value().to_vec());
    } else {
        return Err(super::error::Error::Wierd);
    }
}
*/

#[actix_rt::test]
async fn cache_test(){
    let db = CacheDb::new();
    let mut count: Arc<std::cell::RefCell<i32>> = Arc::new(std::cell::RefCell::new(0));
    let c = count.clone();
    let a = load_or_update(&db, b"test1", 1, || async { *c.borrow_mut() += 1; Ok(vec![1,2,3]) }).await.unwrap();
    assert_eq!(a, vec![1,2,3]);
    for i in 0..100 {
        let c = count.clone();
        let db = db.clone();
        actix_rt::spawn(async move { 
            load_or_update(&db, b"test1", 1, || async move { *c.borrow_mut()+= 1; Ok(vec![4,5,6]) }).await;
        });
    }
    std::thread::sleep(std::time::Duration::from_millis(300));
    let c = count.clone();
    let a = load_or_update(&db, b"test1", 1, || async { *c.borrow_mut()+= 1; Ok(vec![4,5,6]) }).await.unwrap();
    assert_eq!(a, vec![1,2,3]);
    std::thread::sleep(std::time::Duration::from_millis(1000));
    let c = count.clone();
    let a = load_or_update(&db, b"test1", 1, || async { *c.borrow_mut()+= 1; Ok(vec![4,5,6]) }).await.unwrap();
    assert_eq!(a, vec![4,5,6]);
    assert_eq!(*c.borrow_mut(), 2);
}
