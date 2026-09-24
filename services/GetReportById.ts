const API_URL = "http://10.0.2.2:5140";

export async function GetReportById(report_id: number) {

    const response = await fetch(`${API_URL}/reports/${report_id}`, {
        method: "GET",
    });

    const data = await response.json();

    if(!response.ok) {
        throw new Error(data.message);
    }

    return data.report;
}