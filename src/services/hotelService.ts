import axios, { AxiosError } from 'axios';

// API Configuration
const API_ENDPOINT = 'https://admin.mygo.co/api/hotel/HotelSearch';
const API_LOGIN = 'XMLAMC';
const API_PASSWORD = '-G9hkxDSXXYUtwcx73H6';

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
  Tags: string[];
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
export interface HotelSearchResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Search for hotels using the MyGo Hotel API
 * @param params - Search parameters including dates, city, and room configuration
 * @returns Promise with the API response
 */
export async function searchHotels(params: SearchParams): Promise<HotelSearchResponse> {
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
        Tags: [],
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
    const response = await axios.post<HotelSearchResponse>(API_ENDPOINT, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Log error without exposing sensitive data
      console.error('Hotel Search API Error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
      });

      // Log response data separately for debugging (only non-sensitive info)
      if (axiosError.response?.data) {
        console.error('API Response:', axiosError.response.data);
      }

      // Re-throw with status info
      throw new Error(
        `Hotel search API failed: ${axiosError.response?.status || 'Network Error'} - ${axiosError.message}`
      );
    }

    // Handle non-Axios errors
    console.error('Unexpected error during hotel search');
    throw error;
  }
}

export default { searchHotels };
