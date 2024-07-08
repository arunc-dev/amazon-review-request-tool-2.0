import { Select } from "antd";
import React, { useEffect } from "react";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";

export const ReviewGeoDropdown = (props: {
  selectedGeo: (geoDetails: GeoMapsModel) => void;
}) => {
  useEffect(() => {
    console.log("rendered reviewdropdownnp");
  });
  const geoAsArray = Object.keys(geoMaps).map((key: any, index) => {
    return { ...geoMaps[key], key };
  });
  const onChange = (value: any) => {
    console.log(`selected ${value}`, geoMaps[value]);
    props.selectedGeo(geoMaps[value]);
  };
  useEffect(() => {}, []);
  return (
    <Select
      className="min-w-48"
      onChange={onChange}
      defaultValue={geoAsArray[0].marketplaceDisplay}
      options={geoAsArray.map((value, index) => {
        return {
          value: value.key,
          label: <span>{value.marketplaceDisplay}</span>,
        };
      })}
    />
  );
};
