use thiserror::Error as Thiserror;
use actix_web::HttpResponse;
#[derive(Debug, Thiserror)]
pub enum Error {
    #[error("r2d2 error")]
    R2d2(#[from] r2d2::Error),
    #[error("db error")]
    Diesel(#[from] diesel::result::Error),
    #[error("threadpool future canceled")]
    Canceled,
    #[error("cbor encoding failed")]
    Cbor(#[from] serde_cbor::error::Error),
    #[error("query extraction failed")]
    Query(#[from] serde_qs::Error),
    #[error("bad request")]
    BadRequest,
}
impl From<actix_web::error::BlockingError<Error>> for Error {
    fn from(err: actix_web::error::BlockingError<Error>) -> Self {
        match err {
            actix_web::error::BlockingError::Error(err) => err,
            actix_web::error::BlockingError::Canceled => Error::Canceled,
        }
    }
}
impl actix_web::ResponseError for Error {
    fn error_response(&self) -> HttpResponse {
        match self {
            Error::Diesel(err) => match err {
                diesel::NotFound => HttpResponse::NotFound().finish(),
                _ => HttpResponse::InternalServerError().finish(),
            },
            Error::Query(err) => HttpResponse::BadRequest().finish(),
            Error::BadRequest => HttpResponse::BadRequest().finish(),
            _ => HttpResponse::InternalServerError().finish(),
        }
    }
}
/*
#[derive(Serialize, Deserialize, Debug, Error)]
pub struct Error {
    pub error_code: i32,
    pub error_msg: String,
}
impl From<r2d2::Error> for Error {
    fn from(err: r2d2::Error) -> Self {
        Error {
            error_code: 1,
            error_msg: "internal server error".to_string()
        }
    }
}
impl From<diesel::result::Error> for Error {
    fn from(err: diesel::result::Error) -> Self {
        match err {
            diesel::NotFound => Error {
                error_code: 2, 
                error_msg: "item not found".to_string()
            },
            _ => Error {
                error_code: 3,
                error_msg: "internal server error".to_string()
            }
        }
    }
}
impl From<actix_web::error::BlockingError<Error>> for Error {
    fn from(err: actix_web::error::BlockingError<Error>) -> Self {
        match err {
            actix_web::error::BlockingError::Error(err) => err,
            actix_web::error::BlockingError::Canceled => Error {
                error_code: 4,
                error_msg: "internal server error".to_string()
            },
        }
    }
}

impl From<serde_cbor::error::Error> for Error {
    fn from(err: serde_cbor::error::Error) -> Self {
        Error {
            error_code: 5,
            error_msg: "internal server error".to_string()
        }
    }
}
impl From<serde_qs::error::Error> for Error {
    fn from(err: serde_qs::error::Error) -> Self {
        Error {
            error_code: 6,
            error_msg: "invalid query".to_string()
        }
    }
}
*/

