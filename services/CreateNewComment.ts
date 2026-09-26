import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:5140";

export async function CreateComment(user_comment: string, report_id: number) {

    const autentication_token = await SecureStore.getItemAsync("auth_token");

    const response = await fetch(`${API_URL}/reports/${report_id}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${autentication_token}`,
        },
        body: JSON.stringify({
            user_comment: user_comment,
        }),
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message);
    }

    return data;
}