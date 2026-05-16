import * as Location from 'expo-location';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export async function getCurrentPosition(): Promise<GeoPoint | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    // Race against a 5-second timeout — geolocation is best-effort, never blocks scan flow
    const locPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const timeoutPromise = new Promise<null>(resolve =>
      setTimeout(() => resolve(null), 5000)
    );

    const result = await Promise.race([locPromise, timeoutPromise]);
    if (!result) return null;

    return { lat: result.coords.latitude, lng: result.coords.longitude };
  } catch {
    return null;
  }
}
