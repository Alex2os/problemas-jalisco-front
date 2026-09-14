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

    <View className="flex relative flex-col w-full h-full items-center justify-center bg-white p-[20px] gap-5">

      {/* wallpaper */}
      <MainWallpaper />

      <Text className="text-[30px] text-white" style={{fontFamily: "ArchivoBlack"}}>PROBLEMASJALISCO</Text>

      <Pressable onPress={() => router.push('/map')} style={indexStyles.default_button}>
        <Text style={globalStyles.default_text}>Abrir mapa</Text>
      </Pressable>

    </View>
  );
}
