import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import './App.css';
import InfoBox from './InfoBox';
import LineGraph from './LineGraph';
import Map from './Map';
import Table from './Table';
import { preetyPrintStat, sortData } from "./util";
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all").then(response => response.json()).then(data => {
      setCountryInfo(data);
    })
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then(data => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    }

    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then(response => response.json()).then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

      if (countryCode === 'worldwide') {
        setMapCenter({ lat: 34.80746, lng: -40.4796 });
        setMapZoom(2);
      }
      else {
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      }
    })
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>C9tIN - COVID19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select varient="outlined" value={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox isRed active={casesType === "cases"} onClick={(e) => setCasesType("cases")} title="Corona Virus Cases" total={preetyPrintStat(countryInfo.cases)} cases={preetyPrintStat(countryInfo.todayCases)} />
          <InfoBox active={casesType === "recovered"} onClick={(e) => setCasesType("recovered")} title="Recovered" total={preetyPrintStat(countryInfo.recovered)} cases={preetyPrintStat(countryInfo.todayRecovered)} />
          <InfoBox isRed active={casesType === "deaths"} onClick={(e) => setCasesType("deaths")} title="Death" total={preetyPrintStat(countryInfo.deaths)} cases={preetyPrintStat(countryInfo.todayDeaths)} />
        </div>

        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live cases by Country</h3>
          <Table countries={tableData} />
          <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
