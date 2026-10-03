import { TRUCK_SHAPES, truckPartClass, type TruckShape } from './truckArt'

export function TruckShapes({ shapes = TRUCK_SHAPES }: { shapes?: TruckShape[] }) {
  return (
    <>
      {shapes.map(({ part, tag: Tag, attrs }, index) => (
        <Tag key={index} {...attrs} className={truckPartClass(part)} />
      ))}
    </>
  )
}
