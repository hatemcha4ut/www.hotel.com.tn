import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://admin.mygo.co/api/hotel';
const API_LOGIN = 'XMLAMC';
const API_PASSWORD = '-G9hkxDSXXYUtwcx73H6';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TypeScript Interfaces for the API request structure
interface Credential {
  Login: string;
  Password: string;
}

interface BookingDetails {
  CheckIn: string;
  CheckOut: string;
  City: number;
}

interface Filters {
  Keywords: string;
  Category: number[];
  OnlyAvailable: boolean;
}

interface RoomConfig {
  Adult: number;
  Child: number[];
}

interface SearchDetails {
  BookingDetails: BookingDetails;
  Filters: Filters;
  Rooms: RoomConfig[];
}

interface HotelSearchRequestBody {
  Credential: Credential;
  SearchDetails: SearchDetails;
}

// Interface for input parameters (clean interface for calling the function)
export interface SearchParams {
  checkIn: string;    // Format: YYYY-MM-DD
  checkOut: string;   // Format: YYYY-MM-DD
  city: number;
  adults: number;
  children: number[]; // Array of children ages
}

// API Response type (can be expanded based on actual API response)
export type HotelSearchResult = Record<string, unknown>;

export interface HotelSearchResponse {
  HotelSearch?: HotelSearchResult[];
}

/**
 * Search for hotels using the MyGo Hotel API
 * @param params - Search parameters including dates, city, and room configuration
 * @returns Promise with the API response
 */
export async function searchHotels(params: SearchParams): Promise<HotelSearchResult[]> {
  const requestBody: HotelSearchRequestBody = {
    Credential: {
      Login: API_LOGIN,
      Password: API_PASSWORD,
    },
    SearchDetails: {
      BookingDetails: {
        CheckIn: params.checkIn,
        CheckOut: params.checkOut,
        City: params.city,
      },
      Filters: {
        Keywords: '',
        Category: [],
        OnlyAvailable: false,
      },
      Rooms: [
        {
          Adult: params.adults,
          Child: params.children,
        },
      ],
    },
  };

  try {
    const response = await apiClient.post<HotelSearchResponse>('/HotelSearch', requestBody);
    const hotelSearch = response.data?.HotelSearch;

    if (!Array.isArray(hotelSearch)) {
      const actualType = hotelSearch === null ? 'null' : typeof hotelSearch;
      throw new Error(
        `Invalid hotel search response: expected array but received ${actualType}`
      );
    }

    return hotelSearch;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Hotel Search API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
      });

      throw new Error(
        `Hotel search API failed: ${error.response?.status || 'Network Error'} - ${error.message}`
      );
    }

    // Handle non-Axios errors
    console.error('Unexpected error during hotel search');
    throw error;
  }
}

export default { searchHotels };
