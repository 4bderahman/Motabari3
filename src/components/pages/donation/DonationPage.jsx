import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import DonationForm from "./DonationForm";
import TestimonialCarousel from "./TestimonialCarousel";
import TrustBadges from "./TrustBadges";
import ImpactCounter from "./ImpactCounter";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY, {
  stripeAccount: undefined,
  apiVersion: "2023-10-16",
  locale: "en",
});

const DonationPage = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [goalProgress, setGoalProgress] = useState(0);

  useEffect(() => {
    // TODO: Replace with actual API call
    setTotalDonations(15000);
    setGoalProgress(75);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Support Changes Lives Every Day
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join us in making a difference. Every donation brings hope and
            creates lasting impact.
          </p>
        </div>

        <div className="flex flex-col-reverse items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-xl lg:w-1/2">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: undefined,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#500000",
                  },
                },
                loader: "auto",
              }}
            >
              <DonationForm />
            </Elements>
          </div>

          <div className="w-full lg:w-1/2 lg:sticky lg:top-32">
            <ImpactCounter total={totalDonations} progress={goalProgress} />
          </div>
        </div>

        <div className="mt-16">
          <TestimonialCarousel />
          <TrustBadges />
        </div>
      </div>
    </div>
  );
};

export default DonationPage;
