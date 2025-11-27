package common

import (
	"Spark/modules"
	"Spark/utils/cmap"
	"Spark/utils/melody"
	"time"
)

type EventCallback func(modules.Packet, *melody.Session)
type event struct {
	connection string
	callback   EventCallback
	finish     chan bool
	remove     chan bool
}

var events = cmap.New[*event]()

// CallEvent tries to call the callback with the given uuid
// after that, it will notify the caller via the channel
func CallEvent(pack modules.Packet, session *melody.Session) {
	if len(pack.Event) == 0 {
		return
	}
	ev, ok := events.Get(pack.Event)
	if !ok {
		return
	}
	if session != nil && session.UUID != ev.connection {
		return
	}
	ev.callback(pack, session)
	if ev.finish != nil {
		// Use select with default to prevent panic on closed channel
		select {
		case ev.finish <- true:
		default:
			// Channel closed or full, ignore
		}
	}
}

// AddEventOnce adds a new event only once and client
// can call back the event with the given event trigger.
// Event trigger should be uuid to make every event unique.
func AddEventOnce(fn EventCallback, connUUID, trigger string, timeout time.Duration) bool {
	ev := &event{
		connection: connUUID,
		callback:   fn,
		finish:     make(chan bool, 1), // Buffered to prevent goroutine leak
		remove:     make(chan bool, 1), // Buffered to prevent goroutine leak
	}
	events.Set(trigger, ev)
	
	var result bool
	select {
	case ok := <-ev.finish:
		result = ok
	case ok := <-ev.remove:
		result = ok
	case <-time.After(timeout):
		result = false
	}
	
	// Clean up after receiving result
	events.Remove(trigger)
	close(ev.finish)
	close(ev.remove)
	
	return result
}

// AddEvent adds a new event and client can call back
// the event with the given event trigger.
func AddEvent(fn EventCallback, connUUID, trigger string) {
	ev := &event{
		connection: connUUID,
		callback:   fn,
	}
	events.Set(trigger, ev)
}

// RemoveEvent deletes the event with the given event trigger.
// The ok will be returned to caller if the event is temp (only once).
func RemoveEvent(trigger string, ok ...bool) {
	ev, found := events.Get(trigger)
	if !found {
		return
	}
	events.Remove(trigger)
	if ev.remove != nil {
		// Use select with default to prevent panic on closed channel
		value := false
		if len(ok) > 0 {
			value = ok[0]
		}
		select {
		case ev.remove <- value:
		default:
			// Channel closed or full, ignore
		}
	}
	ev = nil
}

// HasEvent returns if the event exists.
func HasEvent(trigger string) bool {
	return events.Has(trigger)
}
