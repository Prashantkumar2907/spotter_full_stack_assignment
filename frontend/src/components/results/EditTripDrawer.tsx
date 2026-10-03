import { Check } from 'lucide-react'
import type { ApiError } from '../../api/client'
import type { TripFormController } from '../../hooks/useTripForm'
import { EDIT_FORM_ID, TripForm } from '../trip-form/TripForm'
import { Button } from '../ui/Button'
import { Dialog } from '../ui/Dialog'

interface EditTripDrawerProps {
  open: boolean
  form: TripFormController
  error: ApiError | null
  onClose: () => void
  onRetry: () => void
}

export function EditTripDrawer({ open, form, error, onClose, onRetry }: EditTripDrawerProps) {
  return (
    <Dialog
      open={open}
      title="Edit trip"
      description="Update the plan with your changes."
      size="drawer"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={EDIT_FORM_ID} icon={Check}>
            Update trip
          </Button>
        </>
      }
    >
      <TripForm form={form} loading={false} error={error} mode="edit" onRetry={onRetry} />
    </Dialog>
  )
}
