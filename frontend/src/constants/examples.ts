import type { LogDetails, Place } from '../types/trip'

export interface TripExample {
  id: string
  title: string
  summary: string
  current: Place
  pickup: Place
  dropoff: Place
  cycleUsed: number
  departureHour: number
  details: LogDetails
}

const CARRIER_DEFAULTS: LogDetails = {
  driver_name: '',
  carrier_name: 'Northline Freight LLC',
  main_office_address: 'Columbus, OH',
  home_terminal_address: 'Columbus, OH',
  vehicle_numbers: '',
  shipping_document: '',
  commodity: '',
}

function carrierDetails(overrides: Partial<LogDetails>): LogDetails {
  return { ...CARRIER_DEFAULTS, ...overrides }
}

const RICHMOND: Place = { label: 'Richmond, VA', lat: 37.5385, lng: -77.4343 }
const NEWARK: Place = { label: 'Newark, NJ', lat: 40.7357, lng: -74.1724 }
const CHICAGO: Place = { label: 'Chicago, IL', lat: 41.8756, lng: -87.6244 }
const DALLAS: Place = { label: 'Dallas, TX', lat: 32.7763, lng: -96.7969 }
const ATLANTA: Place = { label: 'Atlanta, GA', lat: 33.749, lng: -84.388 }
const LOS_ANGELES: Place = { label: 'Los Angeles, CA', lat: 34.0537, lng: -118.2428 }
const DENVER: Place = { label: 'Denver, CO', lat: 39.7392, lng: -104.9903 }
const NEW_YORK: Place = { label: 'New York, NY', lat: 40.7128, lng: -74.006 }
const SEATTLE: Place = { label: 'Seattle, WA', lat: 47.6062, lng: -122.3321 }
const SALT_LAKE: Place = { label: 'Salt Lake City, UT', lat: 40.7608, lng: -111.891 }
const KANSAS_CITY: Place = { label: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 }

export const TRIP_EXAMPLES: TripExample[] = [
  {
    id: 'fmcsa-sample',
    title: 'FMCSA sample day',
    summary: 'Richmond to Newark, one sheet',
    current: RICHMOND,
    pickup: RICHMOND,
    dropoff: NEWARK,
    cycleUsed: 0,
    departureHour: 6,
    details: {
      driver_name: 'John E. Doe',
      carrier_name: "John Doe's Transportation",
      main_office_address: 'Washington, D.C.',
      home_terminal_address: 'Richmond, VA',
      vehicle_numbers: '123, 20544',
      shipping_document: '101601',
      commodity: '',
    },
  },
  {
    id: 'midwest-south',
    title: 'Midwest to Southeast',
    summary: 'Chicago, Dallas, Atlanta, 2 days',
    current: CHICAGO,
    pickup: DALLAS,
    dropoff: ATLANTA,
    cycleUsed: 24,
    departureHour: 7,
    details: carrierDetails({
      driver_name: 'Maria Alvarez',
      vehicle_numbers: 'T-4821 / TR-1130',
      shipping_document: 'BOL 88-20417',
      commodity: 'Palletized goods',
    }),
  },
  {
    id: 'cross-country',
    title: 'Cross-country run',
    summary: 'Los Angeles, Denver, New York',
    current: LOS_ANGELES,
    pickup: DENVER,
    dropoff: NEW_YORK,
    cycleUsed: 30,
    departureHour: 8,
    details: carrierDetails({
      driver_name: 'Daniel Brooks',
      vehicle_numbers: 'T-3307 / TR-0912',
      shipping_document: 'BOL 41-77305',
      commodity: 'Machine parts',
    }),
  },
  {
    id: 'cycle-limit',
    title: 'Near the 70-hour limit',
    summary: 'Seattle, Salt Lake, Kansas City',
    current: SEATTLE,
    pickup: SALT_LAKE,
    dropoff: KANSAS_CITY,
    cycleUsed: 62,
    departureHour: 6,
    details: carrierDetails({
      driver_name: 'Priya Nair',
      vehicle_numbers: 'T-5516 / TR-2204',
      shipping_document: 'BOL 63-10982',
      commodity: 'Dry goods',
    }),
  },
]
