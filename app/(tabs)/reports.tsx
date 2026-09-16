import {useState} from "react";
import {Pressable, Text, TextInput, View} from 'react-native';

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";
import AntDesign from '@expo/vector-icons/AntDesign';


export default function Reports() {

    // example variable for testing.
    const reports = [
        {id: 1, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
        {id: 2, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
        {id: 3, report_type: "bache", created_at: "3 de marzo", ubication: "zona centro"},
    ];

    const [tableReportShown, setTableReportShown] = useState<number>(-1);

    return (
        <View className="w-full h-full flex flex-col justify-center items-center p-[20px] gap-5">

            <View className="flex flex-col items-center justify-start w-full h-[90%] gap-2">

                <Text style={globalStyles.text_subtitle}>Reportes</Text>
                <Text style={globalStyles.default_text}>Consulta los reportes directamente aquí</Text>

                <View className="w-full h-auto gap-5">

                    {/* search bar */}
                    <TextInput className="bg-white w-[100%] h-[50px] h-full text-black p-[10px] text-[15px] rounded-[10px] border-solid border-[2px] border-[#d7d7d7]"
                        placeholder="Busca un reporte..."
                        multiline={false}>
                    </TextInput>

                    <View className="flex flex-col items-center justify-center w-full gap-2">

                        <View className="flex flex-row w-full">
                            <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Problema</Text>
                            <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Ubicación</Text>
                        </View>

                        {reports.map((report) => (
                            <View className="flex flex-col w-full" key={report.id}>

                                <Pressable className="flex flex-col w-full bg-white rounded-[10px] border-solid border-[2px] border-[#d7d7d7]" onPress={() => tableReportShown == report.id ? setTableReportShown(-1) : setTableReportShown(report.id)}>

                                    {tableReportShown != report.id && (
                                        <View className="flex flex-row w-full h-[60px]">
                                            <Text style={indexStyles.report_collapsible_header}>{report.report_type}</Text>

                                            <View className="h-full w-[3px] bg-[#d7d7d7]"></View>

                                            <Text style={indexStyles.report_collapsible_header}>{report.ubication}</Text>

                                            <AntDesign style={indexStyles.report_collapsible_icon} name="caret-down" size={24} color="black" />
                                        </View>
                                    )}

                                    {tableReportShown == report.id && (

                                        <View style={indexStyles.report_table_collapsible}>

                                            <View className="flex flex-row w-full">
                                                <Text style={indexStyles.report_table_collapsible_title}>Información</Text>
                                                <AntDesign style={indexStyles.report_collapsible_icon} name="caret-up" size={24} color="black" />
                                            </View>

                                            <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                <Text style={indexStyles.report_table_collapsible_content}>Tipo: </Text>
                                                <Text style={indexStyles.report_table_collapsible_content}>{report.report_type}</Text>
                                            </View>

                                            <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                <Text style={indexStyles.report_table_collapsible_content}>Fecha:</Text>
                                                <Text style={indexStyles.report_table_collapsible_content}>{report.created_at}</Text>
                                            </View>

                                            <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                <Text style={indexStyles.report_table_collapsible_content}>Ubicación:</Text>
                                                <Text style={indexStyles.report_table_collapsible_content}>{report.ubication}</Text>
                                            </View>

                                            <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                <Text style={indexStyles.report_table_collapsible_content}>Descripción:</Text>
                                                <Text style={indexStyles.report_table_collapsible_content}>{report.created_at}</Text>
                                            </View>

                                            <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                <Text style={indexStyles.report_table_collapsible_content}>Hecho por:</Text>
                                                <Text style={indexStyles.report_table_collapsible_content}>{report.ubication}</Text>
                                            </View>
                                        </View>
                                    )}
                                </Pressable>




                            </View>
                        ))}
                    </View>

                </View>

            </View>
        </View>
    );
}