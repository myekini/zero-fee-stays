"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BookingCancelPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <XCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-neutral-600 text-lg">
            Your payment was cancelled. No charges have been made.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">What happened?</h2>
            <div className="space-y-3 text-neutral-600">
              <p>• You cancelled the payment process before completing it</p>
              <p>• No booking was created and no charges were made</p>
              <p>
                • You can try again anytime with the same or different dates
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">
              💡 Remember: Zero platform fees means more savings for you!
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <a href="/properties">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Properties
              </a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/">Go Home</a>
            </Button>
          </div>

          <p className="text-sm text-neutral-600">
            Need help? Contact our support team for assistance.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
