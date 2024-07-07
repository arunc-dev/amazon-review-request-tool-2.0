import React from "react";

const ReviewInfoBanner = () => {
  return (
    <div>
      <p>
        Ensure that you are not sending multiple review requests for a single
        product.
      </p>
      <p>
        Amazon only permits request a review outside the 5-30 day range after
        the order delivery date.
      </p>
      <p>
        By default, you'll be seeing the orders purchased 5 days ago from Amazon
        marketplace for the selected geo.
      </p>
      <p>Please change the date-range to see the orders of your choice.</p>
    </div>
  );
};

export default ReviewInfoBanner;
