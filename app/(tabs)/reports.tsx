import {useEffect, useState} from "react";
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";
import AntDesign from '@expo/vector-icons/AntDesign';

import {GetAllReports} from "@/services/GetAllReports";


export default function Reports() {

    // example variable for testing.

    const [reports, setReports] = useState<any[]>([])

    async function LoadAllReports() {
        try {
            const data = await GetAllReports();

            setReports(data)

            console.log("Reportes obtenidos.");
        }
        catch(error) {
            console.log("Error al obtener los reportes.", error);
        }
    }

    useEffect(() => {
        LoadAllReports();
    }, []);

    const [reportCollapsibleOpen, setReportCollapsibleOpen] = useState<number>(-1);

    return (
        // in this case we use SafeAreaView so there's no problem with the layout (as it started from the top notch of the phone, which is not what we want),
        // so this is solved by using safeareaview.
        // we also specify "top" on the edges, as not doing so creates weird behavior and doesn't cover the screen properly in the bottom, so we just want-
        // "protection" from the top of the screen which is where the system icons and etc., of the device are.

        // then we use scrollview so the screen is scrollable. 
        <SafeAreaView className="flex-1" edges={["top"]}>

            <ScrollView className="w-full h-full">

                <View className="flex flex-col items-center justify-start w-full h-full gap-2 p-[20px]">

                    <Text style={globalStyles.text_subtitle}>Reportes</Text>
                    <Text style={globalStyles.default_text}>Consulta los reportes directamente aquí</Text>

                    <View className="w-full gap-5">

                        {/* search bar */}
                        <TextInput className="bg-white w-[100%] h-[50px] p-[10px] text-[15px] rounded-[10px] border-solid border-[2px] border-[#d7d7d7]"
                            placeholder="Busca un reporte...">
                        </TextInput>

                        {/* button to update reports. this should be made a global variable so both map and reports pages use the same variable.*/}
                        <Pressable style={indexStyles.default_button_blue} onPress={LoadAllReports}>
                            <Text style={globalStyles.default_text_white}>Actualizar</Text>
                        </Pressable>

                        <View className="flex flex-col items-center justify-center w-full gap-2">

                            <View className="flex flex-row w-full">
                                <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Problema</Text>
                                <Text style={[globalStyles.default_text, indexStyles.report_table_header]}>Ubicación</Text>
                            </View>

                            {reports.map((report) => (
                                <View className="flex flex-col w-full" key={report.id}>

                                    <Pressable className="flex flex-col w-full bg-white rounded-[10px] border-solid border-[2px] border-[#d7d7d7]" onPress={() => reportCollapsibleOpen == report.id ? setReportCollapsibleOpen(-1) : setReportCollapsibleOpen(report.id)}>

                                        {reportCollapsibleOpen != report.id && (
                                            <View className="flex flex-row w-full h-[60px]">
                                                <Text style={indexStyles.report_collapsible_header}>{report.type}</Text>

                                                <View className="h-full w-[3px] bg-[#d7d7d7]"></View>

                                                <Text style={indexStyles.report_collapsible_header}>{report.ubication}</Text>

                                                <AntDesign style={indexStyles.report_collapsible_icon} name="caret-down" size={24} color="black" />
                                            </View>
                                        )}

                                        {reportCollapsibleOpen == report.id && (

                                            <View style={indexStyles.report_table_collapsible}>

                                                <View className="flex flex-row w-full">
                                                    <Text style={indexStyles.report_table_collapsible_title}>Información</Text>
                                                    <AntDesign style={indexStyles.report_collapsible_icon} name="caret-up" size={24} color="black" />
                                                </View>

                                                <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                    <Text style={indexStyles.report_table_collapsible_content}>Tipo: </Text>
                                                    <Text style={indexStyles.report_table_collapsible_content}>{report.type}</Text>
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
                                                    <Text style={indexStyles.report_table_collapsible_content}>{report.description}</Text>
                                                </View>

                                                <View style={indexStyles.report_table_collapsible_content_wrapper}>
                                                    <Text style={indexStyles.report_table_collapsible_content}>Hecho por:</Text>
                                                    <Text style={indexStyles.report_table_collapsible_content}>{report.username}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </Pressable>




                                </View>
                            ))}
                        </View>

                    </View>

                </View>

            </ScrollView>
        </SafeAreaView>
    );
}