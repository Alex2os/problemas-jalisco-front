import {BlurTargetView, BlurView} from 'expo-blur';
import {useRef} from 'react';
import {Image, StyleSheet, View} from 'react-native';

// component to export the main wallpaper, used across the app.
export function MainWallpaper() {

    // first we declare our blur target. in this case we are blurring a view (later we use this variable to specify our blur target.)
    // we declare it as <View | null> instead of just <View> because of the component starting as null before it mounts, so we prevent errors from happening.
    const blurTarget = useRef<View | null>(null);

    return (
        <>
        {/* we first declare a blur target view. in this case we specify our blur target, and the style. by using absolutefill from stylesheet, we can cover-
        the whole screen.*/}
            <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill}>
                {/* then we specify our image. */}
                <Image source={require("@/assets/images/catedral_gdl.jpg")} style={StyleSheet.absoluteFill} />
            </BlurTargetView>

            {/* after specifying the blurtargetview, we can now do blurview, in which we specify the tint, method and intensity, besides the blurtarget we
            previously declared. also we style it so it covers the whole screen.
            like this we have the blur working on our image, and we could apply the same to other things if we wanted.*/}
            <BlurView blurTarget={blurTarget} blurMethod="dimezisBlurView" intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </>
    );
}

