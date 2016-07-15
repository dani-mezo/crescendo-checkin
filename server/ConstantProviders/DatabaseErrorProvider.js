/**
 * Created by S on 2016. 07. 07..
 */
var DatabaseErrorProvider = function() {
    return {
        INSERT_FAILURE:'Could not insert a volunteer',
        INSERT_SUCCESS: 'Successfully inserted a volunteer',
        COLLECTION_FAILURE: 'Collection is not initialized',
        GET_VOLUNTEERS_FAILURE: 'Failed to get volunteers',
        GET_VOLUNTEERS_SUCCESS: 'Successfully got volunteers',
        DB_ERROR: "Database error occurred"

    }
}

module.exports=DatabaseErrorProvider;