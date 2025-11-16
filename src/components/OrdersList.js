import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs, where, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

const ORDERS_PER_PAGE = 10;

const BRANCH_COLORS = {
  'kalkaji': '#e3f2fd',
  'lajpat': '#f3e5f5',
  'sadar': '#e8f5e8',
  'default': '#f5f5f5'
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    delivered: 'all', // 'all', 'delivered', 'pending'
    branch: 'all' // 'all', 'kalkaji', 'lajpat'
  });
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      fromDate: formatDate(firstDay),
      toDate: formatDate(lastDay)
    };
  };

  const [dateFilters, setDateFilters] = useState(getCurrentMonthDates());
  const [appliedDateFilters, setAppliedDateFilters] = useState(getCurrentMonthDates());
  const [openMenuId, setOpenMenuId] = useState(null);
  const [transferModal, setTransferModal] = useState({ isOpen: false, orderId: null, selectedBranch: '' });

  const branches = ['sadar', '46'];

  const logQuery = (queryParams, trigger) => {
    const logData = {
      timestamp: new Date().toISOString(),
      trigger,
      filters: {
        dateRange: `${queryParams.fromDate} to ${queryParams.toDate}`,
        delivered: queryParams.delivered,
        branch: queryParams.branch
      },
      isLoadMore: queryParams.isLoadMore
    };
    console.log('🔍 Query Executed:', logData);
  };

  const buildQuery = useCallback((isLoadMore = false) => {
    const fromDateISO = new Date(appliedDateFilters.fromDate).toISOString();
    const toDateISO = new Date(new Date(appliedDateFilters.toDate).getTime() + 24 * 60 * 60 * 1000).toISOString();
    
    let q = query(
      collection(db, 'lens_orders'),
      where('createdAt', '>=', fromDateISO),
      where('createdAt', '<', toDateISO),
      orderBy('createdAt', 'desc'),
      limit(ORDERS_PER_PAGE)
    );

    if (filters.delivered !== 'all') {
      q = query(
        collection(db, 'lens_orders'),
        where('createdAt', '>=', fromDateISO),
        where('createdAt', '<', toDateISO),
        where('delivered', '==', filters.delivered === 'delivered'),
        orderBy('createdAt', 'desc'),
        limit(ORDERS_PER_PAGE)
      );
    }

    if (filters.branch !== 'all') {
      const baseQuery = filters.delivered !== 'all' 
        ? query(
            collection(db, 'lens_orders'),
            where('createdAt', '>=', fromDateISO),
            where('createdAt', '<', toDateISO),
            where('delivered', '==', filters.delivered === 'delivered'),
            where('branchName', '==', filters.branch),
            orderBy('createdAt', 'desc'),
            limit(ORDERS_PER_PAGE)
          )
        : query(
            collection(db, 'lens_orders'),
            where('createdAt', '>=', fromDateISO),
            where('createdAt', '<', toDateISO),
            where('branchName', '==', filters.branch),
            orderBy('createdAt', 'desc'),
            limit(ORDERS_PER_PAGE)
          );
      q = baseQuery;
    }

    if (isLoadMore && lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    return q;
  }, [appliedDateFilters.fromDate, appliedDateFilters.toDate, filters.delivered, filters.branch, lastDoc]);

  const loadOrders = useCallback(async (isLoadMore = false, trigger = 'manual') => {
    if (!user) {
      setError('Please log in to view orders');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      logQuery({
        fromDate: appliedDateFilters.fromDate,
        toDate: appliedDateFilters.toDate,
        delivered: filters.delivered,
        branch: filters.branch,
        isLoadMore
      }, trigger);
      
      const q = buildQuery(isLoadMore);
      const querySnapshot = await getDocs(q);
      
      const newOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (isLoadMore) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }

      setLastDoc(querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null);
      setHasMore(querySnapshot.docs.length === ORDERS_PER_PAGE);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(`Failed to load orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setLastDoc(null);
      setHasMore(true);
      const trigger = filters.delivered !== 'all' || filters.branch !== 'all' ? 'filter_change' : 'page_load';
      loadOrders(false, trigger);
    }
  }, [filters.delivered, filters.branch, appliedDateFilters.fromDate, appliedDateFilters.toDate, user]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const handleDateChange = (field, value) => {
    setDateFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    setAppliedDateFilters(dateFilters);
  };

  const markAsDelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'lens_orders', orderId);
      await updateDoc(orderRef, {
        delivered: true,
        deliveredAt: new Date().toISOString()
      });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, delivered: true, deliveredAt: new Date().toISOString() }
          : order
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      setError(`Failed to mark order as delivered: ${error.message}`);
    }
  };

  const markAsUndelivered = async (orderId) => {
    try {
      const orderRef = doc(db, 'lens_orders', orderId);
      await updateDoc(orderRef, {
        delivered: false,
        deliveredAt: null
      });
      
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, delivered: false, deliveredAt: null }
          : order
      ));
      
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error marking order as undelivered:', error);
      setError(`Failed to mark order as undelivered: ${error.message}`);
    }
  };

  const toggleMenu = (orderId) => {
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  const openTransferModal = (orderId) => {
    setTransferModal({ isOpen: true, orderId, selectedBranch: '' });
    setOpenMenuId(null);
  };

  const closeTransferModal = () => {
    setTransferModal({ isOpen: false, orderId: null, selectedBranch: '' });
  };

  const transferOrder = async () => {
    if (!transferModal.selectedBranch) return;
    
    try {
      const orderRef = doc(db, 'lens_orders', transferModal.orderId);
      await updateDoc(orderRef, {
        branchName: transferModal.selectedBranch
      });
      
      setOrders(prev => prev.map(order => 
        order.id === transferModal.orderId 
          ? { ...order, branchName: transferModal.selectedBranch }
          : order
      ));
      
      closeTransferModal();
    } catch (error) {
      console.error('Error transferring order:', error);
      setError(`Failed to transfer order: ${error.message}`);
    }
  };



  const formatPowerDisplay = (orderedPower) => {
    if (!orderedPower) return 'N/A';
    
    const { rightSpherical, rightCylindrical, rightAxis, leftSpherical, leftCylindrical, leftAxis, leftAddition, rightAddition } = orderedPower;
    
    const formatEye = (sph, cyl, axis) => {
      let result = sph || '0.00';
      if (cyl && cyl !== '0.00') {
        result += ` ${cyl}`;
        if (axis) result += ` × ${axis}°`;
      }
      return result;
    };

    const rightLine = `R: ${formatEye(rightSpherical, rightCylindrical, rightAxis)}`;
    const leftLine = `L: ${formatEye(leftSpherical, leftCylindrical, leftAxis)}`;
    
    const leftAdd = leftAddition || '0.00';
    const rightAdd = rightAddition || '0.00';
    
    const addLine = leftAdd === rightAdd 
      ? `Add: ${leftAdd}`
      : `Add: R:${rightAdd} L:${leftAdd}`;
    
    return { rightLine, leftLine, addLine };
  };

  const getBranchColor = (branchName) => {
    return BRANCH_COLORS[branchName?.toLowerCase()] || BRANCH_COLORS.default;
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333'
    },
    filters: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    },
    filterLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#555'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    ordersList: {
      display: 'grid',
      gap: '15px'
    },
    orderTile: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      position: 'relative',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    deliveredBadge: {
      position: 'absolute',
      top: '18px',
      right: '50px',
      backgroundColor: '#4caf50',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    pendingBadge: {
      position: 'absolute',
      top: '18px',
      right: '50px',
      backgroundColor: '#ff9800',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    jobCard: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333'
    },
    branch: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#666',
      textTransform: 'uppercase'
    },
    orderDetails: {
      display: 'grid',
      gap: '8px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px'
    },
    detailLabel: {
      fontWeight: '500',
      color: '#555'
    },
    detailValue: {
      color: '#333',
      textAlign: 'right',
      flex: 1,
      marginLeft: '10px'
    },
    powerValue: {
      fontFamily: 'monospace',
      fontSize: '13px'
    },
    loadMoreButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '20px'
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '20px',
      fontSize: '16px',
      color: '#666'
    },
    noOrders: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    },
    error: {
      textAlign: 'center',
      padding: '20px',
      fontSize: '16px',
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      marginBottom: '20px'
    },
    dateFilters: {
      display: 'flex',
      gap: '10px',
      alignItems: 'end',
      marginBottom: '15px',
      flexWrap: 'wrap'
    },
    dateInput: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer'
    },
    menuButton: {
      position: 'absolute',
      top: '0px',
      right: '0px',
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      color: '#666'
    },
    menuDropdown: {
      position: 'absolute',
      top: '35px',
      right: '0px',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '150px'
    },
    menuItem: {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      borderBottom: '1px solid #eee',
      backgroundColor: 'white',
      border: 'none',
      width: '100%',
      textAlign: 'left'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      minWidth: '300px',
      maxWidth: '400px'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px'
    },
    modalButtons: {
      display: 'flex',
      gap: '10px',
      marginTop: '15px'
    },
    modalButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    }

  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Orders List</h1>
        
        <div style={styles.dateFilters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>From Date</label>
            <input
              type="date"
              style={styles.dateInput}
              value={dateFilters.fromDate}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
              required
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>To Date</label>
            <input
              type="date"
              style={styles.dateInput}
              value={dateFilters.toDate}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
              required
            />
          </div>
          
          <button
            style={styles.button}
            onClick={applyDateFilter}
          >
            Apply Date Filter
          </button>
        </div>
        
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Delivery Status</label>
            <select
              style={styles.select}
              value={filters.delivered}
              onChange={(e) => handleFilterChange('delivered', e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Branch</label>
            <select
              style={styles.select}
              value={filters.branch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="sadar">Sadar</option>
              <option value="46">46</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.error}>{error}</div>
      )}
      
      {loading && orders.length === 0 ? (
        <div style={styles.loadingSpinner}>Loading orders...</div>
      ) : orders.length === 0 && !error ? (
        <div style={styles.noOrders}>No orders found</div>
      ) : !error ? (
        <>
          <div style={styles.ordersList}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  ...styles.orderTile,
                  backgroundColor: getBranchColor(order.branchName)
                }}
              >
                <div style={order.delivered ? styles.deliveredBadge : styles.pendingBadge}>
                  {order.delivered ? '✓ DELIVERED' : '⏳ PENDING'} | {order.branchName || 'N/A'}
                </div>
                
                <div style={{ position: 'relative' }}>
                  <button
                    style={styles.menuButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(order.id);
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    ⋮
                  </button>
                  
                  {openMenuId === order.id && (
                    <div style={styles.menuDropdown}>
                      <button
                        style={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          order.delivered ? markAsUndelivered(order.id) : markAsDelivered(order.id);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        {order.delivered ? 'Mark as Undelivered' : 'Mark as Delivered'}
                      </button>
                      <button
                        style={styles.menuItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTransferModal(order.id);
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                      >
                        Transfer
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={styles.orderHeader}>
                  <div style={styles.jobCard}>
                    {order.jobCardInput || order.jobCard || '-'}
                  </div>
                  {/* {!order.delivered && (
                    <div style={styles.branch}>
                      {order.branchName || 'N/A'}
                    </div>
                  )} */}
                </div>
                
                <div style={styles.orderDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Customer Name:</span>
                    <span style={styles.detailValue}>
                      {order.customerName || 'N/A'}
                    </span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Supplier Name:</span>
                    <span style={styles.detailValue}>
                      {order.supplierName || 'N/A'}
                    </span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Lens Description:</span>
                    <span style={styles.detailValue}>
                      {order.lensDescription || 'N/A'}
                    </span>
                  </div>
                  
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Ordered Power:</span>
                    <div style={{...styles.detailValue, ...styles.powerValue}}>
                      {(() => {
                        const power = formatPowerDisplay(order.ordered_power);
                        if (power === 'N/A') return power;
                        return (
                          <>
                            <div>{power.rightLine}</div>
                            <div>{power.leftLine}</div>
                            <div>{power.addLine}</div>
                          </>
                        );
                      })()} 
                    </div>
                  </div>
                  
                  {order.createdAt && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Created:</span>
                      <span style={styles.detailValue}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <button
              style={styles.loadMoreButton}
              onClick={() => loadOrders(true, 'load_more')}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      ) : null}
      
      {transferModal.isOpen && (
        <div style={styles.modal} onClick={closeTransferModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Transfer Order</div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Select Branch:</label>
              <select
                style={styles.select}
                value={transferModal.selectedBranch}
                onChange={(e) => setTransferModal(prev => ({ ...prev, selectedBranch: e.target.value }))}
              >
                <option value="">Choose branch...</option>
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div style={styles.modalButtons}>
              <button
                style={{ ...styles.modalButton, ...styles.primaryButton }}
                onClick={transferOrder}
                disabled={!transferModal.selectedBranch}
              >
                Complete Transfer
              </button>
              <button
                style={{ ...styles.modalButton, ...styles.secondaryButton }}
                onClick={closeTransferModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;