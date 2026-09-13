import {useRouter} from 'expo-router';
import {Pressable, Text, View} from 'react-native';

import {globalStyles} from "@/styles/globalStyles";

// main screen
export default function HomeScreen() {

  const router = useRouter();

  return (
    // first view is only for the layout. (body)
    <View style = {globalStyles.page_body}> 

      <View className = "flex flex-col items-center justify-center rounded-[20px] w-[100%] h-[50%] p-[20px] gap-5 border-solid border-[2px] border-[#d7d7d7]">

        <View className="flex flex-col h-[100px] gap-3 items-center justify-center">
          <Text className = "text-[35px] font-bold"> ProblemasJalisco </Text>
          <Text className = "text-[20px] text-center">Aplicación para reporte de problemas</Text>
        </View>

        <Pressable onPress={() => router.push('/map')} className="flex w-full h-[50px] items-center justify-center rounded-[10px] border-solid border-[2px] border-[#d7d7d7]">
          <Text style = {globalStyles.default_text}>Abrir mapa de Jalisco</Text>
        </Pressable>
      </View>
    </View>
  );
}
