#[derive(Serialize, Deserialize, Debug)]
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
        Error {
            error_code: 2,
            error_msg: "internal server error".to_string()
        }
    }
}
impl From<actix_web::error::BlockingError<Error>> for Error {
    fn from(err: actix_web::error::BlockingError<Error>) -> Self {
        match err {
            actix_web::error::BlockingError::Error(err) => err,
            actix_web::error::BlockingError::Canceled => Error {
                error_code: 3,
                error_msg: "internal server error".to_string()
            },
        }
    }
}
