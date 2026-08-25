function Deliveries() {
    return (
        <>
            <div>
                <div>
                    <h1>Deliveries</h1>
                    {/* Add map */}
                </div>
                <div>
                    <button>Add Delivery</button>
                    <div>
                        <h2>Deliveries</h2>
                        <div>
                        <nav>
                            <ul>
                                <li><button>All</button></li>
                                <li><button>In Transit</button></li>
                                <li><button>Delivered</button></li>
                                <li><button>Delayed</button></li>

                            </ul>
                            </nav>
                            <div>{/* List of deliveries */}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default Deliveries;