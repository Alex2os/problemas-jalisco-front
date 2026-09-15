import {Text, View} from 'react-native';

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function Reports() {

    // example variable for testing.
    const reports = [
        {id: 1, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
        {id: 2, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
        {id: 3, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
    ];

    return (
        <View className="w-full h-full flex flex-col justify-center items-center p-[20px] gap-5">

            <View className="flex flex-col items-center justify-start w-full h-[90%] gap-2">

                <Text style={globalStyles.text_subtitle}>Reportes</Text>
                <Text style={globalStyles.default_text}>Consulta los reportes directamente aquí</Text>

                <View className="w-full h-auto gap-5">
                    <View className="flex flex-row items-center justify-center w-full">

                        <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Tipo de problema</Text>
                        <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Ubicación</Text>
                        <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Fecha</Text>

                    </View>
                    {reports.map((report) => (
                        <View className = "flex flex-row" key={report.id}>
                            <Text style={[globalStyles.default_text, indexStyles.report_table_cell]} className="text-center w-[33%]">{report.report_type}</Text>
                            <Text style={[globalStyles.default_text, indexStyles.report_table_cell]} className="text-center w-[33%]">{report.ubication}</Text>
                            <Text style={[globalStyles.default_text, indexStyles.report_table_cell]} className="text-center w-[33%]">{report.created_at}</Text>
                        </View>
                    ))}
                </View>

            </View>
        </View>
    );
}