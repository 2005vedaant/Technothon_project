const supabase = require("../supabase");

async function findUserByFirebaseUid(firebaseUid) {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

async function createUser(userData) {
    const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

module.exports = {
    findUserByFirebaseUid,
    createUser,
};