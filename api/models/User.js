class User {
    constructor(id, email, verified = null, password = null, name = null, surname = null, sex = null, country = null, age = null, 
        status = null, personal_info = false) {
        this.id = id
        this.email = email
        this.verified = verified
        this.password = password
        this.name = name
        this.surname = surname    
        this.sex = sex
        this.country = country
        this.age = age
        this.status = status
        this.personal_info = personal_info
    }

    // toJSON() {
    //     return JSON.stringify({
    //         name: this.name,
    //         surname: this.surname,
    //         email: this.email,
    //         password: this.password,
    //         sex: this.sex,
    //         country: this.country,
    //         age: this.age,
    //         status: this.status,
    //         verified: this.verified,
    //         personal_info: this.personal_info
    //     })
    // }

    // static fromJSON(json) {
    //     const data = JSON.parse(json) 
    //     return new User(
    //         data.email,
    //         data.password,
    //         data.name,
    //         data.surname,
    //         data.sex,
    //         data.country,
    //         data.age,
    //         data.status,
    //         data.verified,
    //         data.personal_info
    //     )
    // }

    getId() {
        return this.id
    }

    setId(newId) {
        this.id = newId
    }

    getName() {
        return this.name    
    }

    setName(newName) {
        this.name = newName
    }

    getSurname() {
        return this.surname
    }

    setSurname(newSurname) {
        this.surname = newSurname
    }

    getEmail() {
        return this.email
    }

    setEmail(newEmail) {
        this.email = newEmail
    }

    getPassword() {
        return this.email
    }

    setPassword(newEmail) {
        this.email = newEmail
    }

    getSex() {
        return this.sex
    }

    setSex(newSex) {
        this.sex = newSex
    }

    getCountry() {
        return this.country
    }

    setCountry(newCountry) {
        this.conutry = newCountry
    }

    getAge() {
        return this.age
    }

    setAge(newAge) {
        this.age = newAge
    }

    getStatus() {
        return this.status
    }

    setStatus(newStatus) {
        this.status = newStatus
    }
    
    getVerified() {
        return this.verified
    }

    setVerified(newVerified) {
        this.verified = newVerified
    }
    
    getPersonalInfo() {
        return this.personal_info
    }

    setPersonalInfo(newPersonalInfo) {
        this.personal_info = newPersonalInfo
    }
}

export default User