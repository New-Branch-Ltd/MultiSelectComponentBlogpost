# Revolutionizing User Interaction: Unveiling the Power of a Multi-Interval Selector Component

## Introduction
In the ever-evolving landscape of user interface design, crafting intuitive and efficient components is important to delivering a good user experience.

In this article, we delve into the basics of developing this kind of component using React and exploring its capabilities. Some of the use cases are: Selecting parts of audio recording to be edited by audio manipulation software, selecting parts of a video to be cut or more generally selecting multiple intervals of some data to operate on.

Current implementation is going to be rather simple. We will have a container where we render the multi-interval selector. We will have the ability to create a new interval by double clicking on an empty space. We will also have an `X` button to delete an interval. Each interval will have handles to hold and drag. We will also add some logic for collission detection so that the intervals don't overlap. The final component will look something like this.

![multi-interval](/public/after-remove.png)

## Defining the component's interface

Let's start by setting up the related objects and components interfaces.

An interval will be represented by a simple object with `min` and `max` properties.
```ts
// Interval.ts
interface Interval {
  min: number;
  max: number;
}
```

Our custom component will be called `MultiIntervalSelect`. As any other component
that gets input from the user, it needs to have a property for the currently
selected value and a handler, that will be invoked whenever the user
changes the selection.

In practice, there will always be an upper and a lower bound that the intervals
will have to obey to. For example, if we are selecting multiple ranges of a 
video file that we want to cut, or to apply filter to, then the lower bound will
be zero, and the upper bound will be the length of the video. We will define
a `domain` property to represent this.

Another decision we have to make is how to define the component's dimensions on
the screen. Do we need it to fill all the available space in the parent
component, to be responsive and change with screen dimensions, or it will always
have a fixed size? In the real life, these are very nice questions that we need
to answer. But, for the sake of simplicity we will assume that our component
will always have a fixed dimensions, and we will use `width` and `height` properties.

In the end, our main component interface will look something like this:
```ts
// MultiIntervalSelect.ts
interface Props {
  domain: Interval;
  width: number;
  height: number;
  initialValue: Interval[];
  onChange: (newValue: Interval[]) => void;
}

// TODO Controlled vs Uncontrolled component asside?

/// Aside
In general each input can be either controlled or uncontrolled. Controlled in short means that its value is controlled with props and its updated are handled by the container component that is rendering it. Uncontrolled on the other hand means that the container may provide `initialValue`, but doesn't control the actual value of the input. It is handled internally. In our case we are going to create an uncontrolled input, because many of the logic related to a `MultiIntervalSelect` component is in fact state manipulation logic. 

///
// TODO Which one should we use?

function MultiIntervalSelect(props: Props) {
  return <div className="container">TODO</div>;
}
```

## Rendering selected intervals on the screen

The next step is to render the selected intervals on the screen. For each
interval, we will create a left and a right handle, that will later be used to
resize the interval by dragging them. We also need a button for deleting the
interval.

We will use a helper component for rendering a single interval, and we can
start with the following boilerplate

```tsx
// SingleInterval.tsx
interface Props {
  offsetLeft: number;
  width: number;
  interval: Interval;
  onDelete: () => void;
  onLeftDown: () => void;
  onRightDown: () => void;
}

// TODO Should we add a middle handle? What are the benefits
// TODO Should we add a contianer instead of a middle handle?
// TODO Add the delete button
// TODO Do we count the handles

// TODO Can we implement the component, without relying on specific css/visual properties, e.g. Handle width?

function SingleInterval() {
  return (
    <div className="single-interval">
      <div className="left-handle" />
      <div className="right-handle" />
    </div>
  );
}
```

There is an important question that we haven't discussed yet. Do we count the handles? Are the handles part of the interval? This is a good question. The answer may vary depending on your particular needs. What makes the most sense in my opinion is that we should position the handles right at the edges of the interval, so half of a handle will be in the interval, the other half outside. 

Next I will add css to position the handles on the left and right side of the interval and offset them by half of `--handle-width`.

```css
/* MultiIntervalSelect.css */
.container {
  display: flex;
  position: relative;
  background-color: #FCF9BE;
  --handle-width: 20px;
}

.single-interval {
  position: absolute;
  height: 100%;
  display: flex;
  justify-content: space-between;
  background-color: #FFDCA9;
}

.left-handle,
.right-handle {
  width: var(--handle-width);
  height: 100%;
  position: absolute;
  background: rgba(250, 171, 120);
  user-select: none;
}

.left-handle {
  left: calc(-1 * var(--handle-width) / 2);
}

.right-handle {
  left: calc(100% - (var(--handle-width) / 2));
}

.left-handle:hover,
.right-handle:hover {
  cursor: pointer;
  background: rgb(220, 141, 90);
}

```

Then the main component will create a container with the specified dimensions,
and render a `SingleInterval` component for each interval. I will also pass the exact position that the interval should be rendered to and the width of the interval. Another option is to pass a tranformation function to be used in the `SingleInterval` component. I went with the first one in order to keep the lower level component as simple as possible. This is generally a good principle to follow.

```tsx
// MultiIntervalSelect.tsx
function MultiIntervalSelect(props: Props) {
  const { initialValue, width, height, domain, onChange } = props;

  const [intervals, setIntervals] = useState<Interval[]>(initialValue);
  
  const intervalToContainer = domainValueToContainerPosition(
    width,
    domain
  );

  const style = {
    width,
    height,
  };

  return (
    <div className="container" style={style}>
      {intervals.map((i, ind) => {
        const pixelsLeft = intervalToContainer(i.min)
        const pixelsRight = intervalToContainer(i.max)

        return (
          <SingleInterval
            key={ind}
            interval={i}
            width={pixelsRight - pixelsLeft}
            offsetLeft={pixelsLeft}
            onLeftDown={TODO}
            onRightDown={TODO}
            onDelete={TODO}
          />
        )}
      ))}
    </div>
  );
}
```


// Aside
In the implementation you might have noticed that I am passing index as key. This is generally bad, especially if you have a reorder functionality. In our case we don't have a better option, because it will be possible to have intervals that start from the exact same position and end in the same position. Note that this doesn't really make sense in practice so if we were to disable that we could use min/max as key, which would be better. For the sake of simplicity I am using index here as key. It shouldn't brake any of our functionality becase we will not reorder the intervals in out state.

// Aside

## Implementing create interaction

## Resizing intervals





#### Transforming values
For further development we will need to set up some utility functions to transform value from the interval domain to pixel position in the container and vice versa. I will use highter order functions for that and pass the higher order function called with the domain dimensions and `containerWidth`. I am doing this because I don't think there is a reason to pass unnecessary data to the lower level `SingleInterval` component. It will look something like this.

```ts
  export function intervalValueToContainerPosition(
    containerWidth: number,
    domain: Interval
  ) {
    return (intervalValue: number) =>
      (intervalValue * containerWidth) / (domain.max - domain.min);
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
      <div
        className="single-interval"
        style={{ left: pixelsLeft, width: pixelsRight - pixelsLeft }}
      >
        <div className="left-handle" />
        <div className="right-handle" />
      </div>
    );
  }
```

You can see that the left handle is offset by `HANDLE_WIDTH`. We do this because we want only the values between the handles to be part of the interval.
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

Next I will add the `mousemove` event handler on the window and call `onChange` callback to update the position of the handles.

```tsx
  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;

      if (leftMoving) {
        const containerBox = containerRef.current?.getBoundingClientRect();

        const mousePos = ev.clientX;
        const containerMin = containerBox.x;

        const minInPx = mousePos - containerMin + HANDLE_WIDTH / 2;
        const minInInterval = containerToInterval(minInPx);

        if (minInInterval < max) {
          onChange({ min: minInInterval, max });
        }
      } else if (rightMoving) {
        const containerBox = containerRef.current?.getBoundingClientRect();

        const mousePos = ev.clientX;
        const containerMin = containerBox.x;

        const maxInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
        const maxInInterval = containerToInterval(maxInPx);

        if (min < maxInInterval) {
          onChange({ min, max: maxInInterval });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [leftMoving, rightMoving]);
```

You will notice here that I am getting the position of the mouse relative to the container position. I am passing the `containerRef` as a prop. `containerPositionToIntervalValue` is another utility function I have added that looks like that:
```tsx
export function containerPositionToIntervalValue(
  containerWidth: number,
  interval: Interval
) {
  return (containerPosition: number) =>
    (containerPosition * (interval.max - interval.min)) / containerWidth;
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
    />
    <div
      style={{
        position: "absolute",
        left: `${pixelsRight}px`,
        width: `${HANDLE_WIDTH}px`
      }}
      className="right-handle"
      onMouseDown={onRightHandleMouseDown}
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
  function onIntervalChange(interval: Interval) {
    return (newInterval: Interval) => {
      const currentIntervalIndex = intervals.findIndex((i) => i === interval);
      const previousInterval = intervals[currentIntervalIndex - 1];
      const nextInterval = intervals[currentIntervalIndex + 1];

      const newIntervalMin = Math.max(
        newInterval.min,
        previousInterval
          ? previousInterval.max + 2 * containerToInterval(HANDLE_WIDTH)
          : domain.min
      );

      const newIntervalMax = Math.min(
        newInterval.max,
        nextInterval
          ? nextInterval.min - 2 * containerToInterval(HANDLE_WIDTH)
          : domain.max
      );

      const newIntervalBounded: Interval = {
        min: newIntervalMin,
        max: newIntervalMax,
      };

      const newIntervals = intervals.map((i) =>
        i === interval ? newIntervalBounded : i
      );

      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }
``` 

#### Interval Coloring
Here is what we have so far. 

![multi-interval](/public/before-background.png)

As you can see we are not coloring in any meaningful way the selected interval. We can do the coloring of our container in several ways. Use divs for the actual selected area in the interval. This will be a bit complicated, because we will need to resize 2 divs when moving a handle. There is also another idea: to color the background using css `linear-gradient`. I will implement the coloring using the second option, although note that the first one has the benefit of allowing the rendering of text or other things inside the divs.

```tsx
  function getBackgroundImageForIntervals(intervals: Interval[]): string {
    if (intervals.length === 0) {
      return UNSELECTED_COLOR;
    }

    return (
      intervals.reduce(
        (acc, interval) =>
          acc +
          `,${UNSELECTED_COLOR} ${intervalToContainer(
            interval.min
          )}px, ${SELECTED_COLOR} ${intervalToContainer(
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
        left: `${pixelsLeft - HANDLE_WIDTH}px`,
        width: `${HANDLE_WIDTH}px`,
      }}
      className="left-handle"
      onMouseDown={onLeftHandleMouseDown}
    >
      <span className="value">{Number(interval.min).toFixed(1)}</span>
    </div>
    <div
      style={{
        position: "absolute",
        left: `${pixelsRight}px`,
        width: `${HANDLE_WIDTH}px`,
      }}
      className="right-handle"
      onMouseDown={onRightHandleMouseDown}
    >
      <span className="value">{Number(interval.min).toFixed(1)}</span>
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
    const handleOffsetInInterval = containerToInterval(2 * HANDLE_WIDTH)

    const isOutsideIntervals = intervals.every(
      (i) =>
        mousePosInIntervalValue < i.min - handleOffsetInInterval ||
        mousePosInIntervalValue > i.max + handleOffsetInInterval
    );

    if (isOutsideIntervals) {
      const newInterval = {
        min: mousePosInIntervalValue,
        max: mousePosInIntervalValue,
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
        left: `${pixelsRight + HANDLE_WIDTH}px`,
        top: `-${HANDLE_WIDTH}px`,
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
- Testing: When it comes to testing, I'd recommend testing it via e2e testing library like cypress or playwright. It will be the easiest in my opinion. 
- Accessibility: Current implementation is NOT accessible. A few suggestions I have are to make sure that handles and remove buttons are targetable by tab. Maybe increase/decrease of interval with arrows can also be implemented. Also check the aria roles to make sure that screen readers understand properly what we have on screen. 
- Mobile: This component is not particularly convienient for mobile users. The handles should be a little bigger to increase comfort and usability. Also events might be required to change `onDoubleClick` to `onDoubleTap` etc.
- Background Image: In many cases you would want to render an image/graph behind the multi-interval selector. You can do that by positioning the image with `position: absolute` and using semi-transparent colors for the actual multi-interval selector.
- Handles: You might have noticed that it is that the handles themselves are currently not included inside the intervals and it is not clear from our specification if we should include them. That makes it impossible to select two very close intervals(within handle width distance). In some specific cases this might be a problem. An alternative implementation where the handles have a width of 1px and there is a button right above them to drag could solve that. Of course the delete logic would also need to be reworked.

You can check all of the source code in [GitLab](https://gitlab.com/new-branch-ltd/multi-range-selector-blogpost)

You can view a working example in [CodeSandbox](https://codesandbox.io/p/sandbox/multi-interval-vjs8kw?file=%2Fsrc%2FMultiInterval.tsx%3A112%2C50)