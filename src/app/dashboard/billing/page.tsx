"use client";

import type { VariantProps } from "class-variance-authority";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { PriceId } from "~/actions/stripe";
import PricingPlan from "~/components/PricingPlan";
import { Button, buttonVariants } from "~/components/ui/button";

export interface PricingPlanType {
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: VariantProps<typeof buttonVariants>["variant"];
  isPopular?: boolean;
  savePercentage?: string;
  priceId: PriceId;
}

const plans: PricingPlanType[] = [
  {
    title: "Small Pack",
    price: "$9.99",
    description: "Perfect for occasional podcast creators.",
    features: ["50 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 50 credits",
    buttonVariant: "default",
    priceId: "small",
  },
  {
    title: "Medium Pack",
    price: "$24.99",
    description: "Best value for regular podcasters.",
    features: ["150 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 150 credits",
    buttonVariant: "default",
    isPopular: true,
    savePercentage: "Save 17% more.",
    priceId: "medium",
  },
  {
    title: "Large Pack",
    price: "$69.99",
    description: "Ideal for podcast studios and agencies.",
    features: ["500 Credits", "No expiration", "Download all clips"],
    buttonText: "Buy 500 credits",
    buttonVariant: "default",
    savePercentage: "Save 30% more.",
    priceId: "large",
  },
];

const CreditsPage = () => {
  return (
    <div className="relative mx-auto flex flex-col space-y-8 py-12">
      <div className="relative flex items-center gap-4">
        <Button
          variant={"outline"}
          size={"icon"}
          asChild
          className="absolute top-0 left-0"
        >
          <Link href={"/dashboard"}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Buy Credits
          </h1>
          <p className="text-muted-foreground">
            Purchase credits to generate more podcast clips. The more credits
            you buy, the better the value.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan, i) => (
          <PricingPlan key={i} plan={plan} />
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="mb-4 text-lg font-semibold">How credits work?</h3>
        <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
          <li>1 credit = 1 minute of podcast processing.</li>
          <li>The program will create 1 clip per 5 minutes of podcast.</li>
          <li>Credits never expire and can be used anytime.</li>
          <li>Longer podcasts require more credits based on duration.</li>
          <li>All packages are one-time purchases and not subscriptions.</li>
        </ul>
      </div>
    </div>
  );
};

export default CreditsPage;
