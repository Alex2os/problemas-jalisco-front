import {Text, View} from 'react-native';

import {MainWallpaper} from "@/components/MainWallpaper";
import {globalStyles} from "@/styles/globalStyles";

// about page
export default function About() {

  return (
    <View className="flex relative flex-col w-full h-full items-center justify-center bg-white p-[20px]">

      <MainWallpaper />

      <View className="bg-white flex flex-col items-center justify-center rounded-[20px] w-[100%] h-[30%] p-[20px] gap-5  border-solid border-[2px] border-[#d7d7d7]">

         <Text style={globalStyles.text_subtitle}>Acerca de</Text>

      </View>

    </View>
  );
}