import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: 'green', headerShown: false }}>
            <Tabs.Screen
                name="HomeScreen"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="CameraScreen"
                options={{
                    title: 'Camera',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="camera" color={color} />,
                }}
            />
            <Tabs.Screen
                name="AIAssistScreen"
                options={{
                    title: 'AI',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
                }}
            />
            <Tabs.Screen
                name="CropScreen"
                options={{
                    title: 'Crop',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="leaf" color={color} />,
                }}
            />
            <Tabs.Screen
                name="WeatherScreen"
                options={{
                    title: 'Weather',
                    tabBarIcon: ({ color }) => <FontAwesome size={28} name="cloud" color={color} />,
                }}
            />
        </Tabs>
    );
}