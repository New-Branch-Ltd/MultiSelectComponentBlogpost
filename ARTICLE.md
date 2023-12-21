# Multi-Range selector component

## Introduction
Multi-range selector or multi-interval selector input is unversal type of input with many use-cases. Some of them are selecting multiple parts of audio|video recording to perform actions on. Just to  

What is multi-range selector? We can define multi-range selector as an input field on
Creating a multi-range(multi-interval) selector component can be used for several different or other components with complex specifications can be a daunting task. With this article I will hopefully introduce you to the art of creating such components and the process of doing that. This article will follow the process of creation of one such component - multi range selector. In my experience as a software developer I have occasionally needed to create such complex components...


## Specification
We are going to create a multi-range selector. [IMAGE]

- Double click on empty space in the range bar to create new area
- Remove area

## Implementation

#### Setup
Let's start by setting up some constants to be used later.
```tsx
  export const CONTAINER_WIDTH = 800;
  export const HANDLE_WIDTH = 20;
  export const INTERVAL_MIN = 0;
  export const INTERVAL_MAX = 1000;
```

Then let's set up a container and state.

```tsx
interface IntervalType {
  min: number;
  max: number;
}

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([{min: 0, max: 1000}])

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div className="container" style={{width: `${CONTAINER_WIDTH}px`}}>
        {intervals.map((i, ind) => <Interval key={ind} i={i} />)}
      </div>
    </div>
  );
}
```

and an `Interval.tsx` component

```tsx
  interface Props {
    min: number;
    max: number;
  }

  function Interval({min, max}: Props) {
    return (
      <>
        <div className="left-handle" />
        <div className="right-handle" />
      </>
    )
  }
```

and some basic styles to start with:

```css
  .container {
    display: flex;
    height: 200px;
    background: rgba(0,100,255,0.3);
  }

  .left-handle, .right-handle {
    height: 100%;
    background: rgba(0,100,255,0.8);
  }

  .left-handle:hover, .right-handle:hover {
    cursor: pointer;
    background: rgb(0,100,255);
  }
```

#### Transforming values
Now lets set up a utility function to transform value from the interval to 
pixel position in the container. It will look something like that.

```ts
  export function intervalValueToContainerPosition(intervalValue: number) {
    return (intervalValue * CONTAINER_WIDTH) / INTERVAL_MAX;
  }
```

We can then use it in `Interval.tsx` like so:

```tsx
  function Interval({ interval }: Props) {
    const {min, max} = interval;

    const pixelsLeft = intervalValueToContainerPosition(min);
    const pixelsRight = intervalValueToContainerPosition(max);
    
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: `${pixelsLeft}px`,
            width: `${HANDLE_WIDTH}px`
          }}
          className="left-handle"
        />
        <div
          style={{
            position: "absolute",
            left: `${pixelsRight}px`,
            width: `${HANDLE_WIDTH}px`
          }}
          className="right-handle"
        />
      </>
    );
  }

  export default Interval;
```

#### Event Listeners

Our next job will be to hook event listeners on the handles. We can setup the `mousedown` event listener on the handle to update state describing if the handle is moving like so:
```tsx
  const [leftMoving, setLeftMoving] = useState(false);
  const [rightMoving, setRightMoving] = useState(false);

  const pixelsLeft = intervalValueToContainerPosition(min);
  const pixelsRight = intervalValueToContainerPosition(max);

  useEffect(() => {
    function stopMoving() {
      setLeftMoving(false)
      setRightMoving(false)
    }

    window.addEventListener('mouseup', stopMoving)

    return () => {
      window.removeEventListener('mouseup', stopMoving)
    }
  }, [])

  function onLeftHandleMouseDown() {
    setLeftMoving(true)
  }

  function onRightHandleMouseDown() {
    setRightMoving(true)
  }
```

You will notice that here I also added a `mouseup` event handler on the `window` to clear the state. It is added on the `window` to handle edge case when the handle is dragged away from the container and then the mouse button is released.

Next I will add the `mousemove` event handler on the handle and call `onChange` callback to update the position of the handles.

```tsx
  const onLeftMouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (leftMoving && containerRef.current) {  
      const containerBox = containerRef.current?.getBoundingClientRect();
    
      const mousePos = ev.clientX;
      const containerMin = containerBox.x;

      const minInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
      const minInInterval = containerPositionToIntervalValue(minInPx)

      onChange({min: minInInterval, max})
    }
  }

  const onRightMouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (rightMoving && containerRef.current) {
      const containerBox = containerRef.current?.getBoundingClientRect();
    
      const mousePos = ev.clientX;
      const containerMin = containerBox.x;

      const maxInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
      const maxInInterval = containerPositionToIntervalValue(maxInPx)

      onChange({min, max: maxInInterval})
    }
  }
```

You will notice here that I am getting the position of the mouse relative to the container position. I am passing the `containerRef` as a prop. `containerPositionToIntervalValue` is another utility function I have added that looks like that:
```tsx
  export function containerPositionToIntervalValue(containerPosition: number) {
    return (containerPosition * (INTERVAL_MAX - INTERVAL_MIN)) / CONTAINER_WIDTH
}
```

The current jsx in the container component look like that:

```tsx
  <>
    <div
      style={{
        position: "absolute",
        left: `${pixelsLeft}px`,
        width: `${HANDLE_WIDTH}px`
      }}
      className="left-handle"
      onMouseDown={onLeftHandleMouseDown}
      onMouseMove={onLeftMouseMove}
    />
    <div
      style={{
        position: "absolute",
        left: `${pixelsRight}px`,
        width: `${HANDLE_WIDTH}px`
      }}
      className="right-handle"
      onMouseDown={onRightHandleMouseDown}
      onMouseMove={onRightMouseMove}
    />
  </>
```

And here is the `onChange` handler in the container component.

```tsx
  function onIntervalChange(interval: IntervalType) {
    return (newInterval: IntervalType) => {
      setIntervals(intervals.map(i => i === interval ? newInterval : i))
    }
  }
```

Notice that in this event handler we don't handle collisions between intervals or dragging out of the container box. This will be our next task. 

#### Handling Collisions 
For simplicity we will keep all intervals ordered from left to right in the state.
Knowing that this code should do the trick in handling interval collisions.

```tsx
  function onIntervalChange(interval: IntervalType) {
    return (newInterval: IntervalType) => {
      const currentIntervalIndex = intervals.findIndex(i => i === interval);
      const previousInterval = intervals[currentIntervalIndex - 1];
      const nextInterval = intervals[currentIntervalIndex + 1];

      const newIntervalMin = Math.min(Math.max(newInterval.min, previousInterval?.max ?? INTERVAL_MIN), newInterval.max)
      const newIntervalMax = Math.max(Math.min(newInterval.max, nextInterval?.min ?? INTERVAL_MAX,), newInterval.min)

      const newIntervalBounded: IntervalType = {min: newIntervalMin, max: newIntervalMax}

      setIntervals(intervals.map((i) => (i === interval ? newIntervalBounded : i)));
    };
  }
```

Depending on further specification you might want to shift the boundings +- `HANDLE_WIDTH`px. 

#### Background Image
We can color the background of our container using a `linear-gradient` background like so:

```tsx
  export function getBackgroundImageForIntervals(
    intervals: IntervalType[]
  ): string {
    return (
      intervals.reduce(
        (acc, interval) =>
          acc +
          `,${UNSELECTED_COLOR} ${intervalValueToContainerPosition(
            interval.min
          ) + HANDLE_WIDTH}px, ${SELECTED_COLOR} ${intervalValueToContainerPosition(
            interval.min
          )}px ${intervalValueToContainerPosition(
            interval.max
          )}px, ${UNSELECTED_COLOR} ${intervalValueToContainerPosition(
            interval.max
          )}px`,
        "linear-gradient(to right "
      ) + ")"
    );
  }
```
Here we color the background of the container with `SELECTED_COLOR` for regions that are in intervals and with `UNSELECTED_COLOR` otherwise.

#### Creating Intervals

#### Removing Intervals


TODO Expain evnet handlers with code. Actually translate the handles based on the mouse events.


- Event listeners
- Collision
- Background Image
- Create functionality
- Remove functionality


## Notes about testing | a11y | mobile
When it comes to testing, this kind of components can be tested via unit test. I'd rather recommend testing them via an integration test library like cypress or playwright.
TODO Examples::

## Summary And Usages
We created a multi-range selector component that can be used in audio files editor | video editor...