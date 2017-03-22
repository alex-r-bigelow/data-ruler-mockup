/* globals jQuery, d3 */

let CURRENT_MODE = null;
let SHOW_LAYERS = false;
let SHOW_RULES = false;
let CURRENT_SELECTION = 'svg';
let CURRENT_WIDGET = null;

function toggleColorScaleConfig (show) {
  if (show) {
    jQuery('#ExpandedInferredColorScale').show();
    jQuery('#CollapsedColorScales').hide();
  } else {
    jQuery('#ExpandedInferredColorScale').hide();
    jQuery('#CollapsedColorScales').show();
  }
}

function showWidget (widget) {
  CURRENT_WIDGET = widget;
  jQuery('#ColorWidget').hide();
  if (CURRENT_WIDGET !== null) {
    jQuery(CURRENT_WIDGET + 'Widget').show();
  }
}

function changeSelection (selection) {
  CURRENT_SELECTION = selection;

  if (CURRENT_MODE !== null) {
    // Special logic to decide which targets in the drawing to show
    if (CURRENT_SELECTION === '#Svg') {
      jQuery('#IndividualRectTargets, #SvgTarget').hide();
      jQuery('#GroupTarget').show();
    } else {
      jQuery('#IndividualRectTargets, #SvgTarget').show();
      jQuery('#GroupTarget').hide();
    }
  } else {
    jQuery('#IndividualRectTargets, #GroupTarget').hide();
  }

  // Show / hide the indicators of the selection throughout the ui
  ['#Svg', '#Group', '#Rect1', '#Rect2', '#Rect3', '#Rect4', '#Rect5'].forEach(base => {
    if (base !== CURRENT_SELECTION) {
      jQuery(base + 'Rules, ' + base + 'LayerSelection, ' + base + 'Selection').hide();
    } else {
      jQuery(base + 'Selection').show();
      jQuery(base + 'LayerSelection').show();
      jQuery(base + 'Rules').show();
    }
  });
  window.event.stopPropagation();
}

function updateConnections () {
  if (CURRENT_MODE === 'CONNECTING') {
    if (SHOW_LAYERS) {
      if (SHOW_RULES) {
        jQuery('#LayerConnections').show();
        jQuery('#OffsetLayerConnections').hide();
      } else {
        jQuery('#LayerConnections').hide();
        jQuery('#OffsetLayerConnections').show();
      }
      jQuery('#DirectConnections').hide();
    } else {
      jQuery('#LayerConnections, #OffsetLayerConnections').hide();
      jQuery('#DirectConnections').show();
    }
  } else {
    jQuery('#LayerConnections, #DirectConnections').hide();
  }
}

function toggleRules (show) {
  SHOW_RULES = !!show;
  if (SHOW_RULES) {
    jQuery('#RulesWidget').show();
    d3.select('#PieceToShift')
      .attr('transform', null);
  } else {
    jQuery('#RulesWidget').hide();
    d3.select('#PieceToShift')
      .attr('transform', 'translate(576,0)');
  }
  updateConnections();
  window.event.stopPropagation();
}

function toggleLayers (show) {
  SHOW_LAYERS = !!show;
  if (SHOW_LAYERS) {
    jQuery('#LayersWidget').show();
  } else {
    jQuery('#LayersWidget').hide();
  }
  updateConnections();
  window.event.stopPropagation();
}

function switchMode (mode) {
  CURRENT_MODE = mode;
  if (CURRENT_MODE !== 'DRAWING') {
    showWidget(null);
  }

  if (CURRENT_MODE === 'CONNECTING') {
    jQuery('#DrawingTools').hide();
    jQuery('#DataPanel').show();
  } else if (CURRENT_MODE === 'DRAWING') {
    jQuery('#DrawingTools').show();
    jQuery('#DataPanel').hide();
  } else if (CURRENT_MODE === null) {
    jQuery('#DrawingTools, #DataPanel').hide();
  } else {
    throw new Error('unknown mode: ' + CURRENT_MODE);
  }
  updateConnections();
  window.event.stopPropagation();
}

function flashHotspots () {
  d3.selectAll('[onclick]')
  .interrupt()
    .style('opacity', 0.8)
  .transition()
    .duration(1000)
    .ease(d3.easeExpOut)
    .style('opacity', 0.01);
}

function clearHotspots () {
  d3.selectAll('[onclick]').style('opacity', 0.01);
}

function initialSetup () {
  switchMode('DRAWING');
  toggleRules(false);
  toggleLayers(false);
  changeSelection('#Svg');
  toggleColorScaleConfig(false);
  showWidget(null);

  clearHotspots();
  jQuery('body').on('click', flashHotspots);
}

function resizeSVG () {
  let bounds = jQuery('#content svg')[0].getBoundingClientRect();
  let svgAspectRatio = bounds.width / bounds.height;
  let windowAspectRatio = window.innerWidth / window.innerHeight;

  if (windowAspectRatio > svgAspectRatio) {
    d3.select('svg')
      .attr('height', window.innerHeight)
      .attr('width', bounds.width * window.innerHeight / bounds.height);
  } else {
    d3.select('svg')
      .attr('width', null)
      .attr('height', null);
  }
}

function loadSVG () {
  jQuery.ajax({
    url: 'data-ruler-mockup.svg',
    dataType: 'text',
    success: svgText => {
      jQuery('#content').html(svgText);
      resizeSVG();
      initialSetup();
    }
  });
}

window.onload = loadSVG;
window.onresize = resizeSVG;
