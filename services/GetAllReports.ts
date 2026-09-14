const API_URL = "http://10.0.2.2:5140";

export async function GetAllReports() {

    const response = await fetch(`${API_URL}/api/reports/getallreports`, {
        method: "GET",
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message);
    }

    return data.reports;
}