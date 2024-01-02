# Revolutionizing User Interaction: Unveiling the Power of a Multi-Interval Selector Component

## Introduction
In the ever-evolving landscape of user interface design, crafting intuitive and efficient components is paramount to delivering a seamless user experience. Enter the realm of the multi-interval selector component – a groundbreaking tool that empowers developers to revolutionize how users interact with data intervals. 

In this article, we delve into the intricacies of developing this kind of component using React and exploring its capabilities and use cases. Whether you're developing a data visualization application, a scheduling tool, or an e-commerce platform, the multi-interval selector component is a game-changer that promises to elevate your user interface to new heights.

## Specification
We are going to create a multi-interval selector with the following specifications:

![multi-interval](/public/after-remove.png)

- Double click on empty space in the intervals container to create new interval
- Remove interval button on the top right of interval.

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

#### Interval Coloring
Here is what we have so far. 

![multi-interval](/public/before-background.png)

As you can see we are not coloring in any meaningful way the selected interval. We can do the coloring of our container using a `linear-gradient` background like so:

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
Our next task will be to hook the double click event to create a new interval.
We can do it like that.

```tsx
  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const mousePosInIntervalValue = containerPositionToIntervalValue(mousePosInPx);

    const isOutsideIntervals = intervals.every(i => mousePosInIntervalValue < i.min - HANDLE_WIDTH || mousePosInIntervalValue > i.max + HANDLE_WIDTH)

    if (isOutsideIntervals) {
      const newInterval = {min: mousePosInIntervalValue - HANDLE_WIDTH, max: mousePosInIntervalValue + HANDLE_WIDTH}

      const newIntervals = sortBy([...intervals, newInterval], 'min')
      setIntervals(newIntervals)
    }
  }
```
You can notice here that we are creating the interval only if the double click is happening outside of intervals, so that we avoid overlapping intervals problems. Also I am sorting the intervals with lodash `sortBy` function to keep our collision functionality working.

![multi-interval](/public/after-add.png)

#### Removing Intervals
Our last task is to hook removing interval functionality. We can do that by adding an `X` button on the top right of every interval.

```tsx
  <button
    type="button"
    style={{
      position: "absolute",
      left: `${pixelsRight + 20}px`,
      top: `-20px`,
    }}
    onClick={onDelete}
  >
    X
  </button>
```

`onDelete` is passed as prop to the interval component. And its implementation in the container is:

```tsx
  function onDelete(interval: IntervalType) {
    return () => {
      setIntervals(intervals.filter((i) => i !== interval));
    };
  }
```

With this we have a functional implementation following the specification. 🎉🎉🎉

![multi-interval](/public/after-remove.png)

## Further Improvements
- Testing: When it comes to testing, I'd recommend testing it via e2e testing library like cypress or playwright. It will be the easiest in my opinion. You can of course try to test it via unit tests.
- Accessibility: When it comes to a11y, I suggest you do your own research. Current implementation is NOT accessible. Check the aria roles in MDN.
- Mobile: This component is not particularly convienient for mobile users. It should work on smaller screens and also be responsive. The handles should be a little bigger to increase comfort and usability for mobile users.
- Background Image: In many cases you would want to render an image/graph behind the multi-interval selector. You can do that by positioning the image with `position: absolute` and using semi-transparent colors for the actual multi-interval selector.

You can check all of the source code in [GitLab](https://gitlab.com/new-branch-ltd/multi-range-selector-blogpost)