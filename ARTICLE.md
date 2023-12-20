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
        {intervals.map(i => <Interval min={i.min} max={i.max} />)}
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
  function Interval({ min, max }: Props) {
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

Our next job will be to hook event listeners on the handles.

TODO Expain evnet handlers with code. Actually translate the handles based on the mouse events.


- Event listeners
- Create functionaity
- Remove functionality


## Notes about testing | a11y | mobile
When it comes to testing, this kind of components can be tested via unit test. I'd rather recommend testing them via an integration test library like cypress or playwright.
TODO Examples::

## Summary
We created a multi-range selector component that can be used in audio files editor | video editor...