/**
 * Created by S on 2016. 07. 10..
 */
var PublicVolunteer = function(volunteer) {
    return {
        firstname: volunteer.firstname,
        lastname: volunteer.lastname,
        username: volunteer.username
    }
}

module.exports=PublicVolunteer;