import React from "react";

const ReviewInfoBanner = () => {
  return (
    <div
      className="bg-[#ECF2FF] p-4 rounded-lg"
      style={{ borderLeft: "10px solid #094CC0" }}
    >
      <div className="flex justify-start items-start space-x-6">
        <span className="material-symbols-outlined text-[#094CC0]">info</span>
        <ul className="list-disc ml-3">
          <li>
            Ensure that you are not sending multiple review requests for a
            single order.
          </li>
          <li>
            Amazon only permits request a review outside the 5-30 day range
            after the order delivery date.
          </li>
          <li>
            By default, you'll be seeing the orders purchased 5 days ago from
            Amazon marketplace for the selected geo.
          </li>
          <li>
            Please change the date-range to see the orders of your choice.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewInfoBanner;
