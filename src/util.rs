use serde::de::DeserializeOwned;

use serde::de::Deserialize;

use std::default::Default;

#[derive(Debug, Deserialize)]
struct Wrapped<T: DeserializeOwned>(#[serde(deserialize_with = "from_csv")] Vec<T>);

pub fn from_csv_opt<'de, D, T>(deserializer: D) -> Result<Option<Vec<T>>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: DeserializeOwned,
{
	Option::<Wrapped<T>>::deserialize(deserializer)
		.map(|opt_wrapped: Option<Wrapped<T>>| 
			opt_wrapped.map(|wrapped: Wrapped<T>| 
				wrapped.0))
}

pub fn from_csv<'de, D, T>(deserializer: D) -> Result<Vec<T>, D::Error>
where
    D: serde::Deserializer<'de>,
    T: DeserializeOwned,
{
    deserializer.deserialize_str(CSVVecVisitor::<T>::default())
}

/// Visits a string value of the form "v1,v2,v3" into a vector of bytes Vec<u8>
struct CSVVecVisitor<T: DeserializeOwned>(std::marker::PhantomData<T>);

impl<T: DeserializeOwned> Default for CSVVecVisitor<T> {
    fn default() -> Self {
        CSVVecVisitor(std::marker::PhantomData)
    }
}

impl<'de, T: DeserializeOwned> serde::de::Visitor<'de> for CSVVecVisitor<T> {
    type Value = Vec<T>;

    fn expecting(
        &self,
        formatter: &mut std::fmt::Formatter,
    ) -> std::fmt::Result {
        write!(formatter, "a str")
    }

    fn visit_str<E>(self, s: &str) -> std::result::Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        let mut output = Vec::new();
        let mut items = csv::Reader::from_reader(s.as_bytes());
        for res in items.deserialize() {
            let item: T = res.map_err(|e| {
                E::custom(format!(
                    "could not deserialize sequence value: {:?}",
                    e
                ))
            })?;
            output.push(item);
        }

        Ok(output)
    }
}
