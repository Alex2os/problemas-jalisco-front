import * as SecureStore from "expo-secure-store";

const API_URL = "http://10.0.2.2:5140";

export async function CreateReport(type: string, description: string, latitude: number, longitude: number) {

    const autentication_token = await SecureStore.getItemAsync("auth_token");

    const response = await fetch(`${API_URL}/api/reports/createreport`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${autentication_token}`,
        },
        body: JSON.stringify({
            type: type,
            description: description,
            latitude: latitude,
            longitude: longitude,
        }),
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message);
    }

    return data;
}