import React from "react";
import type { PricingPlanType } from "~/app/dashboard/billing/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "~/lib/utils";
import { CheckIcon } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  plan: PricingPlanType;
};

const PricingPlan = ({ plan }: Props) => {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        plan.isPopular && "border-primary border-2",
      )}
    >
      {plan.isPopular && (
        <div className="bg-primary text-primary-foreground absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full px-3 py-1 text-sm font-medium whitespace-nowrap">
          Most Popular
        </div>
      )}
      <CardHeader className="flex-1">
        <CardTitle>{plan.title}</CardTitle>
        <div className="text-4xl font-bold">{plan.price}</div>
        {plan.savePercentage && (
          <p className="text-sm font-medium text-green-600">
            {plan.savePercentage}{" "}
          </p>
        )}
        <CardDescription className="">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ul className="text-muted-foreground space-y-2 text-sm">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center">
              <CheckIcon className="text-primary mr-2 size-4" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <form className="flex w-full flex-col items-center justify-center">
          <Button
            variant={plan.buttonVariant}
            className="w-full"
            disabled
            type="submit"
          >
            {plan.buttonText}
          </Button>
          <p className="text-sm text-gray-400 italic">
            *Payments not implemented. Only a demo app.
          </p>
        </form>
      </CardFooter>
    </Card>
  );
};

export default PricingPlan;
