/// Person data model
class Person {
  name string
  age int?
  email string @alias("email_address")
  address Address?
}

/// Address data model
class Address {
  street string
  city string
  country string
}
