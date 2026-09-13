import {useRouter} from 'expo-router';
import {useRef} from 'react';
import {Pressable, Text, View} from 'react-native';

import {MainWallpaper} from "@/components/MainWallpaper";
import {globalStyles} from "@/styles/globalStyles";
import {indexStyles} from "@/styles/indexStyles";

// main screen
export default function HomeScreen() {

  const router = useRouter();

  const blurTarget = useRef<View | null>(null);

  return (
    // first view is only for the layout. (body)

    <View className="flex relative flex-col w-full h-full items-center justify-end bg-white p-[20px]">

      {/* wallpaper */}
      <MainWallpaper />

      <Text className="text-[30px] text-white absolute top-20" style={{fontFamily: "ArchivoBlack"}}> PROBLEMASJALISCO </Text>

      <View className="bg-white flex flex-col items-center justify-center rounded-[20px] w-[100%] h-[30%] p-[20px] gap-5  border-solid border-[2px] border-[#d7d7d7]">

        <Pressable onPress={() => router.push('/map')} style={indexStyles.main_page_button}>
          <Text style={globalStyles.default_text}>Abrir mapa de Jalisco</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/account')} style={indexStyles.main_page_button}>
          <Text style={globalStyles.default_text}>Cuenta</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/about')} style={indexStyles.main_page_button}>
          <Text style={globalStyles.default_text}>Acerca de</Text>
        </Pressable>


      </View>
    </View>
  );
}
