import {GetReportById} from "@/services/GetReportById";
import AntDesign from '@expo/vector-icons/AntDesign';
import {useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from "react-native-safe-area-context";

import {CreateComment} from "@/services/CreateNewComment";
import {GetCommentsByReportId} from "@/services/GetCommentsByReportId";

import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

export default function ReportDetails() {

  // we can obtain the report_id using this function, which is the parameter that is being sent here.
  const {report_id} = useLocalSearchParams();

  // temporary variable for testing. later this will be the report obtained through the report_id
  const [report, setReport] = useState<any>();
  const [likes, setLikes] = useState<number>();
  const [comments, setComments] = useState<any[]>([]);

  const [userComment, setUserComment] = useState<string>("");

  const [loadingPage, setLoadingPage] = useState<boolean>(true);

  async function LoadReportById(id: number) {
    try {
      const data = await GetReportById(id);

      setReport(data);

      console.log(`Reporte obtenido con id: ${id}.`);

    }
    catch(error) {
      console.log("Error al obtener el reporte.", error);
    }
  }

  async function CreateNewComment(report_id: number) {

    try {

      if(userComment == "") return;

      const data = await CreateComment(userComment, report_id);

      console.log(`Comentario creado con éxito.`);
      console.log(data);

    }
    catch(error) {
      console.log("Error al obtener los comentarios.", error);
    }
  }

  async function LoadCommentsByReportId(id: number) {
    try {
      const data = await GetCommentsByReportId(id);

      setComments(data);

      console.log(`Comentarios obtenidos.`);

    }
    catch(error) {
      console.log("Error al obtener los comentarios.", error);
    }
  }

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        LoadReportById(+report_id),
        LoadCommentsByReportId(+report_id)
      ]);

      setLoadingPage(false);
    }

    loadData();
  }, [report_id]);

  // if the report doesnt load yet, we just show a loading screen.
  if(loadingPage) {
    return (
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView className="w-full h-full">

          <View className="flex items-center justify-center w-full h-full p-[20px]">
            <Text style={globalStyles.text_subtitle}>Cargando...</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    // we specify here in the edges the bottom too, as we don't have the nav var in this case, and could be that the comments overflow so the screen turns-
    // scrollable. in this way we prevent the screen from growing bigger than the safe area view.
    <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
      <ScrollView className="w-full h-full">

        <View className="flex flex-col items-left justify-start w-full h-full gap-3 p-[20px]">

          <Text style={globalStyles.text_subtitle}>Detalles del reporte</Text>

          {/* report info */}
          <View className="flex flex-col w-full gap-3 rounded-[10px] border-solid border-[2px] border-[#d7d7d7] p-[20px] bg-white">
            <View style={indexStyles.report_details_info_container}>
              <Text style={indexStyles.report_details_text}>Tipo:</Text>
              <Text style={indexStyles.report_details_text}>{report.type}</Text>
            </View>

            {/* in the case of the date, we can turn the date given from the backend to a date object, then turning it to a locale string-
              so it appears in spanish, then specifying what things we want inside the string. in this case we specify weekday, hour, minute, etc.*/}
            <View style={indexStyles.report_details_info_container}>
              <Text style={indexStyles.report_details_text}>Fecha:</Text>
              <Text style={indexStyles.report_details_text}>{new Date(report.created_at).toLocaleDateString("es-MX",
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
              <Text style={indexStyles.report_details_text}>Ubicación:</Text>
              <Text style={indexStyles.report_details_text}>{report.ubication}</Text>
            </View>

            <View style={indexStyles.report_details_info_container}>
              <Text style={indexStyles.report_details_text}>Descripción:</Text>
              <Text style={indexStyles.report_details_text}>{report.description}</Text>
            </View>

            <View style={indexStyles.report_details_info_container}>
              <Text style={indexStyles.report_details_text}>Hecho por:</Text>
              <Text style={indexStyles.report_details_text}>{report.username}</Text>
            </View>

          </View>

          {/* report likes and comments buttons*/}
          <View className="flex flex-row w-full h-[50px] items-center justify-center rounded-[10px] border-solid border-[2px] border-[#d7d7d7] bg-white">

            <Pressable className="flex justify-center items-center w-[50%]">
              <AntDesign name="like" size={24} color="black" />
            </Pressable>

            <View className="absolute bg-[#d7d7d7] w-[2px] h-full"></View>

            <Pressable className="flex justify-center items-center w-[50%]">
              <AntDesign name="comment" size={24} color="black" />
            </Pressable>

          </View>

          {/* input to make a comment */}
          <TextInput className="bg-white w-[100%] h-[50px] p-[10px] text-[17px] rounded-[10px] border-solid border-[2px] border-[#d7d7d7]"
            placeholder="Escribe un comentario..."
            returnKeyType="search"
            value = {userComment}
            onChangeText = {setUserComment}
            onSubmitEditing = {() => CreateNewComment(+report_id)}>
          </TextInput>

          {/* comment section */}
          <View className="flex flex-col w-full justify-center items-center gap-5 rounded-[10px] border-solid border-[2px] border-[#d7d7d7] bg-white p-[10px]">

            <Text style={[globalStyles.default_text, {
              textAlign: "left",
              width: "100%",
            }]}>Comentarios</Text>

            {comments.length == 0 && (
              <View className="flex flex-col w-full justify-center items-center">
                <Text style={globalStyles.default_text}>Sé el primero en comentar</Text>
              </View>
            )}


            {/* comments mapped*/}

            {comments.length > 0 && (
              <View className="flex flex-col gap-3 w-full">
                {comments.map((comment) => (
                  <View className="bg-[#d7d7d7] rounded-[10px] p-[10px]" key={comment.id}>
                    <Text style={globalStyles.default_text}>{comment.username}</Text>
                    <Text style={globalStyles.default_text}>{comment.user_comment}</Text>
                  </View>
                ))}
              </View>
            )}

          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  )
}