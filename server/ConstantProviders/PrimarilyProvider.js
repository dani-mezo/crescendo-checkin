/**
 * Created by S on 2016. 07. 07..
 */
var PrimarilyProvider = function(ID) {
    return [
        {
            ID: ID.ARRIVAL_DATE,
            display: "Érkezési dátum",
            input: false,
            db: "arrival"
        },
        {
            ID: ID.LEAVE_DATE,
            display: "Távozási dátum",
            input: "date",
            db: false
        },
        {
            ID: ID.DEBIT,
            display: "Tartozás",
            input: "date",
            db: false
        },
        {
            ID: ID.IFA,
            display: "IFA - papír",
            input: "checkbox",
            db: "birthdate"
        },
        {
            ID: ID.ANTSZ,
            display: "ÁNTSZ - papír",
            input: "checkbox",
            db: "birthdate"
        },
        {
            ID: ID.PARENT_DECLARATION,
            display: "Szűlői nyilatkozat",
            input: "checkbox",
            db: "birthdate"
        },
        {
            ID: ID.DEPOSIT,
            display: "Depozit ellenőrzés",
            input: "checkbox",
            db: false
        },
        {
            ID: ID.DIET,
            display: "Diéta típusa",
            input: false,
            db: false
        }
    ]
}

module.exports=PrimarilyProvider;