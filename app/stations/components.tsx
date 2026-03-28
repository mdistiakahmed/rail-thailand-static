'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Autocomplete, TextField, Button, Box, Typography } from '@mui/material';
import { FaSearch, FaTrain } from 'react-icons/fa';
import Image from 'next/image';

interface Route {
  route: string;
  filename: string;
}

interface SearchStationButtonProps {
  stations: string[];
  routes: Route[];
}

export const SearchStationButton: React.FC<SearchStationButtonProps> = ({ stations, routes }) => {
  const router = useRouter();
  const [startStation, setStartStation] = useState('');
  const [destinationStation, setDestinationStation] = useState('');

  const handleSearch = () => {
    if (startStation && !destinationStation) {
      // Only start station - go to routes page
      const slug = startStation.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/-+/g, '-');
      router.push(`/stations/${slug}`);
    } else if (startStation && destinationStation) {
      // Both stations - find matching route
      const matchingRoute = routes.find((route: Route) => {
        const [routeStart, routeEnd] = route.route.split(' - ');
        return (routeStart === startStation && routeEnd === destinationStation);
      });
      
      if (matchingRoute) {
        const destinationSlug = matchingRoute.filename.replace('.json', '');
        const startStationSlug =  startStation.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/-+/g, '-');
        router.push(`/stations/${startStationSlug}/${destinationSlug}`);
      } else {
        alert('No direct route found between these stations. Please try different stations.');
      }
    } else {
      alert('Please enter at least a start station');
    }
  };

  const handleInputChange = (value: string, type: 'start' | 'destination') => {
    if (type === 'start') {
      setStartStation(value);
    } else {
      setDestinationStation(value);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <Typography variant="h5" className="mb-6 text-center">
        Search Train Routes
      </Typography>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Autocomplete
            freeSolo
            options={stations}
            inputValue={startStation}
            onInputChange={(_, value) => handleInputChange(value, 'start')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="From Station" 
                variant="outlined"
                fullWidth
                placeholder="Enter departure station"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                {option}
              </Box>
            )}
          />
        </div>
        
        <div>
          <Autocomplete
            freeSolo
            options={stations}
            inputValue={destinationStation}
            onInputChange={(_, value) => handleInputChange(value, 'destination')}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="To Station (Optional)" 
                variant="outlined"
                fullWidth
                placeholder="Enter destination station"
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                {option}
              </Box>
            )}
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button 
          variant="contained" 
          size="large"
          onClick={handleSearch}
          startIcon={<FaSearch />}
          className="px-8"
        >
          Search Routes
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          {startStation && !destinationStation && 
            "Will show all routes from " + startStation
          }
          {startStation && destinationStation && 
            "Will search for direct route between " + startStation + " and " + destinationStation
          }
          {!startStation && 
            "Enter a departure station to begin searching"
          }
        </p>
      </div>
    </div>
  );
};

export default SearchStationButton;