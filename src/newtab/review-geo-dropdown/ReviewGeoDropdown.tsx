import { Select } from "antd";
import React, { useEffect } from "react";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";
import { CircleFlag } from "react-circle-flags";
import { get, set } from "../../helpers/Cache";

export const ReviewGeoDropdown = (props: {
  selectedGeo: (geoDetails: GeoMapsModel) => void;
}) => {
  const geoAsArray = Object.keys(geoMaps).map((key: any, index) => {
    return { ...geoMaps[key], key, uniqueKey: key };
  });
  const onChange = async (value: any) => {
    // await set("selectedGeo", value);
    props.selectedGeo(geoMaps[value]);
  };
  useEffect(() => {
    // (async () => {
    //   const selectedGeoUniqueKey = await get("selectedGeo");
    //   onChange(selectedGeoUniqueKey);
    // })();
  }, []);
  return (
    <Select
      className="min-w-56"
      onChange={onChange}
      defaultValue={geoAsArray[0].uniqueKey}
      labelRender={(details) => {
        const key = details.value || "AMAZON_US";
        return (
          <div className="flex space-x-2 justify-start items-center">
            <CircleFlag
              countryCode={geoMaps[key].countryCode}
              height="10"
              className="h-5"
            />
            <span>
              Amazon {geoMaps[key].marketPlace} ({geoMaps[key].tail})
            </span>
          </div>
        );
      }}
      options={geoAsArray.map((value, index) => {
        return {
          value: value.uniqueKey,
          label: (
            <div className="flex space-x-2 justify-start items-center">
              <CircleFlag
                countryCode={value.countryCode}
                height="10"
                className="h-5"
              />
              <span>
                Amazon {value.marketPlace} ({value.tail})
              </span>
            </div>
          ),
        };
      })}
    />
  );
};
