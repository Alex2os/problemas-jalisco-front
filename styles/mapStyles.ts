import {StyleSheet} from 'react-native';

// No realizar llamadas a hooks desde este archivo. Los hooks solo deben ejecutarse dentro de componentes React y no en archivos externos.

export const mapStyles = StyleSheet.create({
    update_reports_button: {
        position: "absolute",
        top: 60,
        left: "50%",

        height: 50,
        width: "60%",

        justifyContent: "center",
        alignItems: "center",

        backgroundColor: "white",

        borderColor: "#d7d7d7",
        borderWidth: 2,
        borderRadius: 10,

        transform: [
            {translateX: "-50%"},
        ],
    },
    marker_wrapper: {
        padding: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    report_problem_flex: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",

        backgroundColor: "white",
        borderRadius: 10,
        borderColor: "#d7d7d7",
        borderWidth: 2,

        gap: 20,
        height: "55%",
        width: "80%",

        padding: 20,

        top: "50%",
        left: "50%",

        transform: [
            {translateY: "-50%"},
            {translateX: "-50%"},
        ],
    },
});