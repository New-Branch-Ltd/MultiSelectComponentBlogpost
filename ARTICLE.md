# Revolutionizing User Interaction: Unveiling the Power of a Multi-Interval Selector Component

## Introduction
In the ever-evolving landscape of user interface design, crafting intuitive and efficient components is paramount to delivering a seamless user experience.

In this article, we delve into the specifics of developing this kind of component using React and exploring its capabilities. Some of the use cases are: Selecting parts of audio recording to be edited by audio manipulation software, selecting parts of a video to be cut or more generally selecting multiple intervals of some data to operate on.

Current implementation is going to be rather simple. We will have a container where we render the multi-interval selector. We will have the ability to create a new interval by double clicking on an empty space. We will also have an `X` button to delete an interval. Each interval will have handles to hold and drag. We will also add some logic for collission detection so that the intervals don't overlap. The final component will look something like that.

![multi-interval](/public/after-remove.png)

## Implementation

#### Setup
Let's start by defining an interface for the component. I would suggest something like this:
```ts
  interface Interval {
    min: number;
    max: number;
  }

  interface Props {
    domain: {
      min: number;
      max: number;
    };
    container: {
      width: number;
      height: number;
    };
    initial: Interval[];
    onChange: (intervals: Interval[]) => void;
  }

  function MultiInterval(props: Props) {
    return <div>Multi Interval</div>;
  }
```
Here I am passing the container dimensions where the multi-interval will be rendered.
Also I am passing a domain minimum and maximum for the values.
Then let's set up a container and state.

```tsx
const UNSELECTED_COLOR = "#FCF9BE";

function MultiInterval(props: Props) {
  const { initial, container } = props;

  const [intervals, setIntervals] = useState<Interval[]>(initial);

  const style = {
    background: UNSELECTED_COLOR,
    width: container.width,
    height: container.height,
  };

  return <div className="container" style={style}></div>;
}
```

and an `SingleInterval.tsx` component

```tsx
  interface Props {
    interval: Interval;
  }

  function SingleInterval() {
    return (
      <>
        <div className="left-handle" />
        <div className="right-handle" />
      </>
    );
  }
```

and some basic styles to start with:

```css
  .container {
    display: flex;
    position: relative;
  }

  .left-handle,
  .right-handle {
    height: 100%;
    background: rgba(250, 171, 120, 0.8);
  }

  .left-handle:hover,
  .right-handle:hover {
    cursor: pointer;
    background: rgb(250, 171, 120);
  }
```

#### Transforming values
Now lets set up a utility function to transform value from the interval to 
pixel position in the container. It will look something like this.

```ts
  export function intervalValueToContainerPosition(
    containerWidth: number,
    interval: Interval
  ) {
    return (intervalValue: number) =>
      (intervalValue * containerWidth) / (interval.max - interval.min);
  }
```

We can then use it in `SingleInterval.tsx` like so:

```tsx
  interface Props {
    interval: Interval;
    intervalToContainer: (intervalValue: number) => number;
  }

  function SingleInterval(props: Props) {
    const { interval, intervalToContainer } = props;
    const { min, max } = interval;

    const pixelsLeft = intervalToContainer(min);
    const pixelsRight = intervalToContainer(max);
    
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
```

And here is how the transformation function is passed to the SingleInterval component.

```tsx
  const intervalToContainer = intervalValueToContainerPosition(
    container.width,
    domain
  );

  return (
    <div className="container" style={style}>
      {intervals.map((i, ind) => (
        <SingleInterval
          key={ind}
          interval={i}
          intervalToContainer={intervalToContainer}
        />
      ))}
    </div>
  );
```

#### Event Listeners

Our next job will be to hook event listeners on the handles. We can setup the `mousedown` event listener on the handle like so:
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
  function onIntervalChange(interval: Interval) {
    return (newInterval: Interval) => {
      const newIntervals = intervals.map((i) =>
        i === interval ? newInterval : i
      );
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }

  return (
    <div className="container" style={style} ref={containerRef}>
      {intervals.map((i, ind) => (
        <SingleInterval
          key={ind}
          interval={i}
          intervalToContainer={intervalToContainer}
          containerToInterval={containerToInterval}
          containerRef={containerRef}
          onChange={onIntervalChange(i)}
        />
      ))}
    </div>
  );
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

#### Interval Coloring
Here is what we have so far. 

![multi-interval](/public/before-background.png)

As you can see we are not coloring in any meaningful way the selected interval. We can do the coloring of our container in several ways. Use divs for the actual selected area in the interval. This will be a bit complicated, because we will need to resize 2 divs when moving a handle. There is also another idea: to color the background using css `linear-gradient`. I will implement the coloring using the second option, although note that the first one has the benefit of allowing the rendering of text or other things inside the divs.

```tsx
  function getBackgroundImageForIntervals(intervals: Interval[]): string {
    return (
      intervals.reduce(
        (acc, interval) =>
          acc +
          `,${UNSELECTED_COLOR} ${
            intervalToContainer(interval.min) + HANDLE_WIDTH
          }px, ${SELECTED_COLOR} ${intervalToContainer(
            interval.min
          )}px ${intervalToContainer(
            interval.max
          )}px, ${UNSELECTED_COLOR} ${intervalToContainer(interval.max)}px`,
        "linear-gradient(to right "
      ) + ")"
    );
  }
```
Here we color the background of the container with `SELECTED_COLOR` for regions that are in intervals and with `UNSELECTED_COLOR` otherwise.

#### Display Interval Values
Next I would like to display the interval values right under the handles. This can easily be done by adding a span inside the div handles like so:

```tsx
    <div
      style={{
        position: "absolute",
        left: `${pixelsLeft}px`,
        width: `${HANDLE_WIDTH}px`,
      }}
      className="left-handle"
      onMouseDown={onLeftHandleMouseDown}
      onMouseMove={onLeftMouseMove}
    >
      <span className="value">{interval.min}</span>
    </div>
    <div
      style={{
        position: "absolute",
        left: `${pixelsRight}px`,
        width: `${HANDLE_WIDTH}px`,
      }}
      className="right-handle"
      onMouseDown={onRightHandleMouseDown}
      onMouseMove={onRightMouseMove}
    >
      <span className="value">{interval.max}</span>
    </div>
  </>
```
and adding a bit more css to position the text properly:

```css
  .value {
    position: relative;
    top: 100%;
  }
```
#### Creating Intervals
Our next task will be to hook the double click event to create a new interval.
We can do it like that.

```tsx
  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const mousePosInIntervalValue = containerToInterval(mousePosInPx);

    const isOutsideIntervals = intervals.every(
      (i) =>
        mousePosInIntervalValue < i.min - HANDLE_WIDTH ||
        mousePosInIntervalValue > i.max + HANDLE_WIDTH
    );

    if (isOutsideIntervals) {
      const newInterval = {
        min: mousePosInIntervalValue - HANDLE_WIDTH,
        max: mousePosInIntervalValue + HANDLE_WIDTH,
      };

      const newIntervals = sortBy([...intervals, newInterval], "min");
      setIntervals(newIntervals);
      props.onChange(newIntervals)
    }
  };
```
You can notice here that we are creating the interval only if the double click is happening outside of intervals, so that we avoid overlapping intervals problems. Also I am sorting the intervals with lodash `sortBy` function to keep our collision functionality working.

![multi-interval](/public/after-add.png)

#### Removing Intervals
Our last task is to hook remove interval functionality. We can do that by adding an `X` button on the top right of every interval.

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
  function onDelete(interval: Interval) {
    return () => {
      const newIntervals = intervals.filter((i) => i !== interval);
      setIntervals(newIntervals);
      props.onChange(newIntervals);
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
- Handles: You might have noticed that it is that the handles themselves are currently not included inside the intervals and it is not clear from our specification if we should include them. That makes it impossible to select two very close intervals(within handle width distance). In some specific cases this might be a problem. An alternative implementation where the handles have a width of 1px and there is a button right above them to drag could solve that. Of course the delete logic would also need to be reworked.

You can check all of the source code in [GitLab](https://gitlab.com/new-branch-ltd/multi-range-selector-blogpost)