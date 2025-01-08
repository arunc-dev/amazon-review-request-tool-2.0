import { Select } from "antd";
import React, { useEffect, useState } from "react";
import { geoMaps, GeoMapsModel } from "../constants/geo-constants";
import { CircleFlag } from "react-circle-flags";
import { get, set } from "../../helpers/Cache";

export const ReviewGeoDropdown = (props: {
  selectedGeo: (geoDetails: GeoMapsModel) => void;
}) => {
  const [defaultGeo, setDefaultGeo] = useState<string>();
  const geoAsArray = Object.keys(geoMaps).map((key: any, index) => {
    return { ...geoMaps[key], key, uniqueKey: key };
  });
  const onChange = async (value: any) => {
    await set("selectedGeo", value);
    props.selectedGeo(geoMaps[value]);
  };
  useEffect(() => {
    (async () => {
      const selectedGeoUniqueKey = (await get("selectedGeo")) as string;
      console.log(
        selectedGeoUniqueKey || geoAsArray[0].uniqueKey,
        "defaultGeo"
      );
      setDefaultGeo(selectedGeoUniqueKey || geoAsArray[0].uniqueKey);
      onChange(selectedGeoUniqueKey);
    })();
  }, []);
  return (
    <>
      {defaultGeo ? (
        <Select
          className="min-w-56"
          onChange={onChange}
          defaultValue={defaultGeo}
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
      ) : (
        ""
      )}
    </>
  );
};
