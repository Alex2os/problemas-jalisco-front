import {useLocalSearchParams} from "expo-router";
import {useState} from "react";
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function ReportDetails() {

  // we can obtain the report_id using this function, which is the parameter that is being sent here.
  const {report_id} = useLocalSearchParams();

  // temporary variable for testing. later this will be the report obtained through the report_id
  const [report, setReport] = useState({
    type: report_id,
    ubication: "123",
    created_at: "asd",
    description: "22",
    username: "yo",
  });

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <ScrollView className="w-full h-full">

        <View className="flex flex-col items-left justify-start w-full h-full gap-5 p-[20px]">

          <Text style={globalStyles.text_subtitle}>Detalles del reporte</Text>

          <View style={indexStyles.report_details_info_container}>
            <Text style = {indexStyles.report_details_text}>Tipo:</Text>
            <Text style = {indexStyles.report_details_text}>{report.type}</Text>
          </View>

          {/* in the case of the date, we can turn the date given from the backend to a date object, then turning it to a locale string-
              so it appears in spanish, then specifying what things we want inside the string. in this case we specify weekday, hour, minute, etc.*/}
          <View style={indexStyles.report_details_info_container}>
            <Text style = {indexStyles.report_details_text}>Fecha:</Text>
            <Text style = {indexStyles.report_details_text}>{new Date(report.created_at).toLocaleDateString("es-MX",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</Text>
          </View>

          <View style={indexStyles.report_details_info_container}>
            <Text style = {indexStyles.report_details_text}>Ubicación:</Text>
            <Text style = {indexStyles.report_details_text}>{report.ubication}</Text>
          </View>

          <View style={indexStyles.report_details_info_container}>
            <Text style = {indexStyles.report_details_text}>Descripción:</Text>
            <Text style = {indexStyles.report_details_text}>{report.description}</Text>
          </View>

          <View style={indexStyles.report_details_info_container}>
            <Text style = {indexStyles.report_details_text}>Hecho por:</Text>
            <Text style = {indexStyles.report_details_text}>{report.username}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}