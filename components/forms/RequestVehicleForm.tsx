"use client";

import { useState } from "react";
import { Field } from "@/components/forms/Field";
import { ValidatedForm } from "@/components/forms/ValidatedForm";

export function RequestVehicleForm() {
  const [type, setType] = useState("Purchase a vehicle");

  return (
    <ValidatedForm action="/api/request-vehicle" submitLabel="Submit Vehicle Request">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-white">Request Type *</span>
        <select name="requestType" value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-md border border-white/15 bg-blackline-charcoal px-4 py-3 text-white outline-none focus:border-white">
          <option>Purchase a vehicle</option>
          <option>Lease or rent a commercial vehicle</option>
        </select>
      </label>
      <Field label="Contact Name" name="contactName" required />
      <Field label="Business Name" name="businessName" />
      <Field label="Phone Number" name="phone" required />
      <Field label="Email Address" name="email" type="email" required />
      <Field label="Preferred Contact Method" name="preferredContactMethod" required options={["Phone", "Email", "Text"]} />
      <Field label="Vehicle Type" name="vehicleType" required />
      <Field label="Make" name="make" />
      <Field label="Model" name="model" />
      <Field label="Desired Year Range" name="desiredYearRange" />
      <Field label="Desired Price or Monthly Budget" name="budget" required />
      <Field label="Desired Start or Purchase Date" name="desiredDate" type="date" />
      <Field label="Vehicle Location or Delivery Location" name="location" required />
      {type === "Lease or rent a commercial vehicle" && (
        <>
          <Field label="Type of Business" name="typeOfBusiness" />
          <Field label="Years in Business" name="yearsInBusiness" />
          <Field label="Number of Vehicles Needed" name="numberOfVehicles" />
          <Field label="Intended Vehicle Use" name="intendedUse" />
          <Field label="Estimated Monthly Mileage" name="estimatedMonthlyMileage" />
          <Field label="Preferred Lease Length" name="preferredLeaseLength" />
          <Field label="Primary Operating State" name="operatingState" />
          <Field label="Driver Information" name="driverInformation" />
          <Field label="Insurance Status" name="insuranceStatus" />
        </>
      )}
      <div className="md:col-span-2">
        <Field label="Additional Notes" name="notes" textarea />
      </div>
    </ValidatedForm>
  );
}
