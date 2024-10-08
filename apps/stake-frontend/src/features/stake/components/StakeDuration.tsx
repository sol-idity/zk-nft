import React, { useEffect, useState } from "react";

import Typography from "@/components/common/Typography";

interface StakeDurationProps {
  stakedAt: string;
  className?: string;
}

export default function StakeDuration({
  stakedAt,
  className,
}: StakeDurationProps) {
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const stakeDate = new Date(stakedAt);

    const updateDuration = () => {
      const now = new Date();

      const difference = now.getTime() - stakeDate.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setDuration(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateDuration();

    // Update every second
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [stakedAt]);

  return (
    <Typography variant="large" className={className}>
      {duration}
    </Typography>
  );
}
