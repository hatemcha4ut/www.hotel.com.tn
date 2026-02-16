import { supabase } from '../lib/supabaseClient'

export const searchHotels = async (searchParams) => {
  // searchParams example: 
  // { cityId: 1, checkIn: "2026-07-15", checkOut: "2026-07-20", rooms: [{adults: 2, children: []}] }

  const { data, error } = await supabase.functions.invoke('hotel-search', {
    body: searchParams
  })

  if (error) {
    console.error('Supabase Function Error:', error)
    throw error
  }

  // The Edge Function returns XML string in data.data
  // You will need a parser here to convert XML string to JSON for React to render
  return data
}
