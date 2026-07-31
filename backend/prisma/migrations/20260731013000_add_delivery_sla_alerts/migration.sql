ALTER TABLE "OperationalAlert"
  DROP CONSTRAINT "OperationalAlert_type_check";

ALTER TABLE "OperationalAlert"
  ADD CONSTRAINT "OperationalAlert_type_check"
  CHECK ("type" IN (
    'DIFFUSION_DEAD',
    'DIFFUSION_DELAY_WARNING',
    'DIFFUSION_DELAY_CRITICAL',
    'DIFFUSION_PROCESSING_STUCK'
  ));
